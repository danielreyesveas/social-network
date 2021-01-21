import { validate, isEmpty } from "class-validator";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import User from "../entities/User";

import auth from "../middleware/auth";

import bcrypt from "bcrypt";
import user from "../middleware/user";

const mapErrors = (errors: Object[]) => {
	return errors.reduce((prev: any, err: any) => {
		prev[err.property] = Object.entries(err.constraints)[0][1];
		return prev;
	}, {});
};

const register = async (request: Request, response: Response) => {
	const { email, username, password } = request.body;

	try {
		let errors: any = {};

		const emailUser = await User.findOne({ email });
		const usernameUser = await User.findOne({ username });

		if (emailUser) errors.email = "Email is already taken";
		if (usernameUser) errors.username = "Username is already taken";

		if (Object.keys(errors).length > 0)
			return response.status(400).json(errors);

		const user = new User({ email, username, password });

		errors = await validate(user);
		if (errors.length > 0) {
			return response.status(400).json(mapErrors(errors));
		}

		await user.save();

		return response.json(user);
	} catch (error) {
		console.error(error);

		return response.status(500).json(error);
	}
};

const login = async (request: Request, response: Response) => {
	const { username, password } = request.body;

	try {
		let errors: any = {};

		if (isEmpty(username)) errors.username = "Must not be empty.";
		if (isEmpty(password)) errors.password = "Must not be empty.";

		if (Object.keys(errors).length > 0)
			return response.status(400).json(errors);

		const user = await User.findOne({ username });

		if (!user)
			return response.status(404).json({ general: "Wrong credentials." });

		const passwordMatches = await bcrypt.compare(password, user.password);

		if (!passwordMatches)
			return response.status(401).json({ general: "Wrong credentials." });

		const token = jwt.sign({ username }, process.env.JWT_SECRET!);

		response.set(
			"Set-Cookie",
			cookie.serialize("token", token, {
				httpOnly: true, // Can´t be access by JS.
				secure: process.env.NODE_ENV === "production", // Can´t be access without https.
				sameSite: "strict",
				maxAge: 3600,
				path: "/",
			})
		);

		return response.json(user);
	} catch (error) {
		console.error(error);
		return response.json({ error: "Something weng wrong." });
	}
};

const me = (_: Request, response: Response) => {
	return response.json(response.locals.user);
};

const logout = (_: Request, response: Response) => {
	response.set(
		"Set-Cookie",
		cookie.serialize("token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			expires: new Date(0),
			path: "/",
		})
	);

	return response.status(200).json({ success: true });
};

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", user, auth, me);
router.get("/logout", user, auth, logout);

export default router;
