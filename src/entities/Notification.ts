import {
	BeforeInsert,
	Column,
	Entity as TOEntity,
	Index,
	JoinColumn,
	ManyToOne,
} from "typeorm";

import Entity from "./Entity";
import Sub from "./Sub";
import Post from "./Post";
import User from "./User";
import Comment from "./Comment";

import { makeId } from "../utils/helpers";

@TOEntity("notifications")
export default class Notification extends Entity {
	constructor(notification: Partial<Notification>) {
		super();
		Object.assign(this, notification);
	}

	@Index()
	@Column()
	identifier: string;

	@Column()
	username: string;

	@Column({ nullable: true })
	sendername: string;

	@Column({ nullable: true })
	subName: string;

	@ManyToOne(() => User, (user) => user.notifications)
	@JoinColumn({ name: "username", referencedColumnName: "username" })
	user: User;

	@ManyToOne(() => User)
	@JoinColumn({ name: "sendername", referencedColumnName: "username" })
	sender: User;

	@ManyToOne(() => Sub)
	@JoinColumn({ name: "subName", referencedColumnName: "name" })
	sub: Sub;

	@ManyToOne(() => Post)
	post: Post;

	@ManyToOne(() => Comment)
	comment: Comment;

	@Column()
	type: string;

	@Column({ nullable: true })
	value: string;

	@Column("boolean", { default: false })
	read: boolean = false;

	@BeforeInsert()
	makeIdAndSlug() {
		this.identifier = makeId(8);
	}
}
