import { Expose } from "class-transformer";
import { IsEmail, Length } from "class-validator";
import {
	Entity as TOEntity,
	Column,
	Index,
	BeforeInsert,
	OneToMany,
} from "typeorm";

import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

import Entity from "./Entity";
import Post from "./Post";
import Vote from "./Vote";
import Follow from "./Follow";
import Comment from "./Comment";

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

	@Exclude()
	@OneToMany(() => Comment, (comment) => comment.user)
	comments: Comment[];

	@OneToMany(() => Vote, (vote) => vote.user)
	votes: Vote[];

	@Exclude()
	@OneToMany(() => Follow, (follow) => follow.user)
	follows: Follow[];

	@Exclude()
	@OneToMany(() => Follow, (follow) => follow.followedUser)
	followers: Follow[];

	@Expose()
	get postCount(): number {
		return this.posts?.length;
	}

	@Expose()
	get commentCount(): number {
		return this.comments?.length;
	}

	@Expose() get followCount(): number {
		return this.follows?.reduce(
			(prev, current) => prev + (current.value || 0),
			0
		);
	}

	@Expose() get followerCount(): number {
		return this.followers?.length;
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
