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

	@OneToMany(() => Post, (post) => post.user)
	posts: Post[];

	@OneToMany(() => Vote, (vote) => vote.user)
	votes: Vote[];

	@BeforeInsert()
	async hashPassword() {
		this.password = await bcrypt.hash(this.password, 6);
	}
}
