import { Router, Request, Response } from "express";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";

import Sub from "../entities/Sub";
import User from "../entities/User";

import auth from "../middleware/auth";

const createSub = async (request: Request, response: Response) => {
	const { name, title, description } = request.body;

	const user: User = response.locals.user;

	try {
		let errors: any = {};

		if (isEmpty(name)) errors.name = "Name must not be empty.";
		if (isEmpty(title)) errors.title = "Title must not be empty.";

		const sub = await getRepository(Sub)
			.createQueryBuilder("sub")
			.where("lower(sub.name) = :name", { name: name.toLowerCase() })
			.getOne();

		if (sub) errors.name = "Sub exists already";

		if (Object.keys(errors).length > 0) {
			throw errors;
		}
	} catch (error) {
		console.error(error);
		return response.status(400).json(error);
	}

	try {
		const sub = new Sub({ name, title, description, user });

		await sub.save();

		return response.json(sub);
	} catch (error) {
		console.error(error);
		return response.status(500).json({ error: "Something went wrong." });
	}
};

const router = Router();

router.post("/", auth, createSub);

export default router;
