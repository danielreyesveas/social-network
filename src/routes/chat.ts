import { Router, Request, Response } from "express";

import User from "../entities/User";

import auth from "../middleware/auth";
import user from "../middleware/user";

const getUsers = async (_: Request, response: Response) => {
	const user: User = response.locals.user;

	try {
		const users = await User.find({
			order: { createdAt: "DESC" },
		});
		return response.json(users);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const router = Router();

router.get("/get-users", user, auth, getUsers);

export default router;
