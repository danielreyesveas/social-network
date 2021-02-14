import { Entity as TOEntity, Column, ManyToOne, JoinColumn } from "typeorm";

import Entity from "./Entity";
import Sub from "./Sub";
import User from "./User";

export enum Status {
	PENDING = "pending",
	ACEPTED = "accepted",
	REJECTED = "rejected",
}

@TOEntity("subMembers")
export default class SubMember extends Entity {
	constructor(subMember: Partial<SubMember>) {
		super();
		Object.assign(this, subMember);
	}

	@Column({
		type: "enum",
		enum: Status,
		default: Status.PENDING,
	})
	status: Status;

	@Column()
	username: string;

	@Column()
	subName: string;

	@ManyToOne(() => User)
	@JoinColumn({ name: "username", referencedColumnName: "username" })
	user: User;

	@ManyToOne(() => Sub)
	@JoinColumn({ name: "subName", referencedColumnName: "name" })
	sub: Sub;
}
