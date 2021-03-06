import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";

export default async (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	try {
		const token = request.cookies.token;

		if (!token) return next();

		const { username }: any = jwt.verify(token, process.env.JWT_SECRET!);
		const user = await User.findOne(
			{ username },
			{
				relations: [
					"notifications",
					"notifications.sender",
					"notifications.sub",
					"notifications.post",
					"notifications.comment",
				],
			}
		);

		response.locals.user = user;
		return next();
	} catch (error) {
		console.error(error);
		return response.status(401).json({ error: "Unauthenticated." });
	}
};
