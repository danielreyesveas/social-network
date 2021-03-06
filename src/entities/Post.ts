import { Exclude, Expose } from "class-transformer";
import {
	Entity as TOEntity,
	Column,
	Index,
	ManyToOne,
	JoinColumn,
	BeforeInsert,
	OneToMany,
} from "typeorm";
import { makeId, slugify } from "../utils/helpers";
import Bookmark from "./Bookmark";
import Comment from "./Comment";

import Entity from "./Entity";
import Sub from "./Sub";
import User from "./User";
import Vote from "./Vote";

@TOEntity("posts")
export default class Post extends Entity {
	constructor(post: Partial<Post>) {
		super();
		Object.assign(this, post);
	}

	@Index()
	@Column()
	identifier: string; // 7 Character Id

	@Column()
	title: string;

	@Column({ nullable: true })
	imageUrn?: string;

	@Index()
	@Column()
	slug: string;

	@Column({ nullable: true, type: "text" })
	body: string;

	@Column()
	subName: string;

	@Column()
	username: string;

	@ManyToOne(() => User, (user) => user.posts)
	@JoinColumn({ name: "username", referencedColumnName: "username" })
	user: User;

	@ManyToOne(() => Sub, (sub) => sub.posts)
	@JoinColumn({ name: "subName", referencedColumnName: "name" })
	sub: Sub;

	@Exclude()
	@OneToMany(() => Comment, (comment) => comment.post)
	comments: Comment[];

	@Exclude()
	@OneToMany(() => Vote, (vote) => vote.post)
	votes: Vote[];

	@Exclude()
	@OneToMany(() => Bookmark, (bookmark) => bookmark.post)
	bookmarks: Bookmark[];

	@Expose() get commentCount(): number {
		return this.comments?.length;
	}

	@Expose() get voteScore(): number {
		return this.votes?.reduce(
			(prev, current) => prev + (current.value || 0),
			0
		);
	}

	@Expose() get url(): string {
		return `/g/${this.subName}/${this.identifier}/${this.slug}`;
	}

	@Expose()
	get imageUrl(): string | undefined {
		return this.imageUrn
			? `${process.env.APP_URL}/images/posts/${this.imageUrn}`
			: undefined;
	}

	protected userVote: number;
	setUserVote(user: User) {
		const index = this.votes?.findIndex(
			(v) => v.username === user.username
		);
		this.userVote = index > -1 ? this.votes[index].value : 0;
	}

	protected userBookmark: boolean;
	setUserBookmark(user: User) {
		const index = this.bookmarks?.findIndex(
			(b) => b.username === user.username
		);
		this.userBookmark = index > -1;
	}

	@BeforeInsert()
	makeIdAndSlug() {
		this.identifier = makeId(7);
		this.slug = slugify(this.title);
	}
}
