import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import User from "../entities/User";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

import { makeId } from "../utils/helpers";
import auth from "../middleware/auth";

import user from "../middleware/user";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";

const getUserSubmissions = async (request: Request, response: Response) => {
	try {
		const user = await User.findOneOrFail({
			where: { username: request.params.username },
			select: [
				"id",
				"username",
				"email",
				"createdAt",
				"imageUrn",
				"accountType",
			],
			relations: [
				"follows",
				"followers",
				"followers.user",
				"posts",
				"comments",
			],
		});

		const posts = await Post.find({
			where: { user },
			relations: ["comments", "votes", "sub"],
		});

		const comments = await Comment.find({
			where: { user },
			relations: ["post"],
		});

		if (response.locals.user) {
			posts.forEach((p) => p.setUserVote(response.locals.user));
			comments.forEach((c) => c.setUserVote(response.locals.user));
			user.setUserFollow(response.locals.user);
		}

		let submissions: any[] = [];

		posts.forEach((p) => submissions.push({ type: "Post", ...p.toJSON() }));
		comments.forEach((c) =>
			submissions.push({ type: "Comment", ...c.toJSON() })
		);
		submissions.sort((a, b) => {
			if (b.createdAt > a.createdAt) return 1;
			if (b.createdAt < a.createdAt) return -1;
			return 0;
		});

		return response.json({ user, submissions });
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const upload = multer({
	storage: multer.diskStorage({
		destination: "public/images/profiles",
		filename: (_, file, callback) => {
			const name = makeId(15);
			callback(null, name + path.extname(file.originalname));
		},
	}),
	fileFilter: (_, file: any, callback: FileFilterCallback) => {
		if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
			callback(null, true); // Accept file
		} else {
			callback(new Error("El archivo no es una imagen."));
		}
	},
});

const uploadUserImage = async (request: Request, response: Response) => {
	const user: User = response.locals.user;

	try {
		if (user.username !== request.params.username) {
			fs.unlinkSync(request.file.path);
			return response.status(400).json({
				error: "No tienes los permisos para realizar esta acción.",
			});
		}

		let oldImageUrn: string = "";

		oldImageUrn = user.imageUrn || "";
		user.imageUrn = request.file.filename;

		await user.save();

		if (oldImageUrn) {
			fs.unlinkSync(`public\\images\\profiles\\${oldImageUrn}`);
		}

		return response.json(user);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const searchUsers = async (request: Request, response: Response) => {
	const user: User = response.locals.user;
	try {
		const username = request.params.username;

		if (isEmpty(username)) {
			return response
				.status(400)
				.json({ error: "La búsqueda no puede estar vacía." });
		}

		let users;
		let { membersNames } = request.body;

		if (user) {
			membersNames.push(user.username);
		}

		if (membersNames.length) {
			users = await getRepository(User)
				.createQueryBuilder()
				.where("LOWER(username) LIKE :username", {
					username: `%${username.toLowerCase().trim()}%`,
				})
				.andWhere("username NOT IN (:...membersNames)", {
					membersNames,
				})
				.limit(6)
				.getMany();
		} else {
			users = await getRepository(User)
				.createQueryBuilder()
				.where("LOWER(username) LIKE :username", {
					username: `%${username.toLowerCase().trim()}%`,
				})
				.limit(6)
				.getMany();
		}

		return response.json(users);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const profile = async (_: Request, response: Response) => {
	try {
		const user = await User.findOneOrFail({
			where: { username: response.locals.user.username },
			select: [
				"id",
				"username",
				"email",
				"bio",
				"createdAt",
				"imageUrn",
				"accountType",
			],
			relations: [
				"notifications",
				"notifications.sender",
				"notifications.sub",
				"notifications.post",
				"notifications.comment",
				"follows",
				"followers",
				"followers.user",
				"members",
				"members.sub",
				"subs",
				"posts",
				"comments",
			],
		});

		const posts = await Post.find({
			where: { username: response.locals.user.username },
			relations: ["comments", "votes", "sub"],
		});

		const comments = await Comment.find({
			where: { username: response.locals.user.username },
			relations: ["post"],
		});

		if (response.locals.user) {
			posts.forEach((p) => p.setUserVote(response.locals.user));
			comments.forEach((c) => c.setUserVote(response.locals.user));
		}

		let submissions: any[] = [];

		posts.forEach((p) => submissions.push({ type: "Post", ...p.toJSON() }));
		comments.forEach((c) =>
			submissions.push({ type: "Comment", ...c.toJSON() })
		);
		submissions.sort((a, b) => {
			if (b.createdAt > a.createdAt) return 1;
			if (b.createdAt < a.createdAt) return -1;
			return 0;
		});

		return response.json({ user, submissions });
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const router = Router();

router.post(
	"/:username/image",
	user,
	auth,
	upload.single("file"),
	uploadUserImage
);
router.post("/search/:username", user, searchUsers);
router.get("/profile", user, auth, profile);
router.get("/user/:username", user, getUserSubmissions);

export default router;
