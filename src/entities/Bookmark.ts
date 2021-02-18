import { Entity as TOEntity, Column, ManyToOne, JoinColumn } from "typeorm";

import Entity from "./Entity";
import Post from "./Post";
import User from "./User";

@TOEntity("bookmarks")
export default class Bookmark extends Entity {
	constructor(bookmark: Partial<Bookmark>) {
		super();
		Object.assign(this, bookmark);
	}

	@ManyToOne(() => User)
	@JoinColumn({ name: "username", referencedColumnName: "username" })
	user: User;

	@Column()
	username: string;

	@Column()
	postId: number;

	@ManyToOne(() => Post)
	@JoinColumn({ name: "postId", referencedColumnName: "id" })
	post: Post;
}
