import { validate, isEmpty } from "class-validator";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import User, { AccountType } from "../entities/User";

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

		if (emailUser) errors.email = "El correo ya tiene una cuenta asociada.";
		if (usernameUser)
			errors.username = "El nombre de usuario ya ha sido utilizado.";

		if (Object.keys(errors).length > 0)
			return response.status(400).json(errors);

		const user = new User({ email, username, password });

		errors = await validate(user);
		if (errors.length > 0) {
			return response.status(400).json(mapErrors(errors));
		}

		await user.save();

		const token = jwt.sign({ username }, process.env.JWT_SECRET!);

		response.set(
			"Set-Cookie",
			cookie.serialize("token", token, {
				httpOnly: true, // Can´t be access by JS.
				secure: process.env.NODE_ENV === "production", // Can´t be access without https.
				sameSite: "strict",
				maxAge: 5 * 60 * 1000,
				path: "/",
			})
		);

		return response.json({ user, token });
	} catch (error) {
		console.error(error);

		return response.status(500).json(error);
	}
};

const login = async (request: Request, response: Response) => {
	const { username, password } = request.body;

	try {
		let errors: any = {};

		if (isEmpty(username)) errors.username = "Campo requerido.";
		if (isEmpty(password)) errors.password = "Campo requerido.";

		if (Object.keys(errors).length > 0)
			return response.status(400).json(errors);

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

		if (!user)
			return response.status(404).json({
				general: "Nombre de usuario y/o contraseña incorrectos.",
			});

		const passwordMatches = await bcrypt.compare(password, user.password);

		if (!passwordMatches)
			return response.status(401).json({
				general: "Nombre de usuario y/o contraseña incorrectos.",
			});

		const token = jwt.sign({ username }, process.env.JWT_SECRET!);

		response.set("Set-Cookie", [
			cookie.serialize("token", token, {
				httpOnly: true, // Can´t be access by JS.
				secure: process.env.NODE_ENV === "production", // Can´t be access without https.
				sameSite: "strict",
				maxAge: 5 * 60 * 1000,
				path: "/",
			}),
		]);
		return response.json({ user, token });
	} catch (error) {
		console.error(error);
		return response.json({ error: "Algo no ha salido bien..." });
	}
};

const loginWithGoogle = async (request: Request, response: Response) => {
	const { displayName, email, photoURL } = request.body;

	try {
		let user: User | undefined;

		user = await User.findOne(
			{ email },
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

		if (!user) {
			const newUser = new User({
				email,
				username: displayName,
				accountType: AccountType.GOOGLE,
				imageUrn: photoURL,
			});

			await newUser.save();

			user = await User.findOne(
				{ email },
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
		}

		const token = jwt.sign(
			{ username: displayName },
			process.env.JWT_SECRET!
		);

		response.set("Set-Cookie", [
			cookie.serialize("token", token, {
				httpOnly: true, // Can´t be access by JS.
				secure: process.env.NODE_ENV === "production", // Can´t be access without https.
				sameSite: "strict",
				maxAge: 5 * 60 * 1000,
				path: "/",
			}),
			cookie.serialize("public_token", token, {
				httpOnly: false, // Can´t be access by JS.
				secure: process.env.NODE_ENV === "production", // Can´t be access without https.
				sameSite: "strict",
				maxAge: 5 * 60 * 1000,
				path: "/",
			}),
		]);

		return response.json({ user, token });
	} catch (error) {
		console.error(error);
		return response.json({ error: "Algo no ha salido bien..." });
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
router.post("/login-with-google", loginWithGoogle);
router.get("/me", user, auth, me);
router.get("/logout", user, auth, logout);

export default router;
