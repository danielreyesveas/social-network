import { NextFunction, Request, Response } from "express";
import User from "../entities/User";

export default async (_: Request, response: Response, next: NextFunction) => {
	try {
		const user: User | undefined = response.locals.user;

		if (!user) throw new Error("Unauthenticated.");

		return next();
	} catch (error) {
		console.error(error);
		return response.status(401).json({ error: "Unauthenticated." });
	}
};
