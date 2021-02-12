import { Entity as TOEntity, Column, ManyToOne, JoinColumn } from "typeorm";

import Entity from "./Entity";
import Sub from "./Sub";
import User from "./User";

@TOEntity("follows")
export default class Follow extends Entity {
	constructor(follow: Partial<Follow>) {
		super();
		Object.assign(this, follow);
	}

	@Column()
	value: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: "username", referencedColumnName: "username" })
	user: User;

	@Column()
	username: string;

	@ManyToOne(() => Sub)
	sub: Sub;

	@ManyToOne(() => User)
	followedUser: User;
}
