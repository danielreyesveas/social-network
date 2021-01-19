import { NextFunction, Request, Response } from "express";

export default (request: Request, response: Response, next: NextFunction) => {
	const exceptions = ["password"];

	Object.keys(request.body).forEach((key) => {
		if (
			!exceptions.includes(key) &&
			typeof request.body[key] === "string"
		) {
			request.body[key] = request.body[key].trim();
		}
	});

	next();
};
