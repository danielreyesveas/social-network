import { Expose } from "class-transformer";
import { IsEmail, Length } from "class-validator";
import {
	Entity as TOEntity,
	Column,
	Index,
	BeforeInsert,
	OneToMany,
	ManyToMany,
} from "typeorm";

import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

import Entity from "./Entity";
import Post from "./Post";
import Vote from "./Vote";
import Follow from "./Follow";
import Comment from "./Comment";
import Notification from "./Notification";
import SubMember from "./SubMember";
import Sub from "./Sub";

@TOEntity("users")
export default class User extends Entity {
	constructor(user: Partial<User>) {
		super();
		Object.assign(this, user);
	}

	@Index()
	@IsEmail(undefined, { message: "Email no válido." })
	@Length(1, 255, {
		message: "Must not be empty.",
	})
	@Column({ unique: true })
	email: string;

	@Index()
	@Length(3, 255, {
		message: "Debe ser de al menos 3 caracteres.",
	})
	@Column({ unique: true })
	username: string;

	@Exclude()
	@Column()
	@Length(6, 255, {
		message: "Debe ser de al menos 6 caracteres.",
	})
	password: string;

	@Column({ nullable: true, type: "text" })
	bio: string;

	@Column({ nullable: true })
	imageUrn: string;

	@Expose()
	get imageUrl(): string {
		return this.imageUrn
			? `${process.env.APP_URL}/images/profiles/${this.imageUrn}`
			: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
	}

	@Exclude()
	@OneToMany(() => Post, (post) => post.user)
	posts: Post[];

	@OneToMany(() => Sub, (sub) => sub.user)
	subs: Sub[];

	@Exclude()
	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Comment[];

	@Exclude()
	@OneToMany(() => Notification, (notification) => notification.user)
	notifications: Notification[];

	@OneToMany(() => Vote, (vote) => vote.user)
	votes: Vote[];

	@Exclude()
	@OneToMany(() => Follow, (follow) => follow.user)
	follows: Follow[];

	@Exclude()
	@OneToMany(() => Follow, (follow) => follow.followedUser)
	followers: Follow[];

	@Exclude()
	@OneToMany(() => SubMember, (member) => member.user)
	members: SubMember[];

	@Expose()
	get postCount(): number {
		return this.posts?.length;
	}

	@Expose()
	get commentCount(): number {
		return this.comments?.length;
	}

	@Expose() get followCount(): number {
		return this.follows?.length;
	}

	@Expose() get followerCount(): number {
		return this.followers?.length;
	}

	@Expose() get membersCount(): number {
		return this.members?.filter((m) => m.status === "accepted").length;
	}

	@Expose() get notificationCount(): number {
		return this.notifications?.filter((n) => !n.read).length;
	}

	@Expose() get followPreview(): Follow[] {
		return this.follows?.slice(-10).reverse();
	}

	@Expose() get followersPreview(): Follow[] {
		return this.followers?.slice(-10).reverse();
	}

	@Expose() get membersPreview(): SubMember[] {
		return this.members
			?.filter((m) => m.status === "accepted")
			.slice(-10)
			.reverse();
	}

	@Expose() get invitations(): SubMember[] {
		return this.members?.filter((m) => m.status === "pending").reverse();
	}

	@Expose() get lastNotifications(): Notification[] {
		return this.notifications
			?.filter((n) => !n.read)
			.slice(-6)
			.reverse();
	}

	@Expose() get allNotifications(): Notification[] {
		return this.notifications?.reverse();
	}

	@Expose() get url(): string {
		return `/u/${this.username}`;
	}

	protected userFollow: number;
	setUserFollow(user: User) {
		const index = this.followers?.findIndex(
			(v) => v.username === user.username
		);
		this.userFollow = index > -1 ? this.followers[index].value : 0;
	}

	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 6);
	}
}
