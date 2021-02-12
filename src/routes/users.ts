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

const getUserSubmissions = async (request: Request, response: Response) => {
	try {
		const user = await User.findOneOrFail({
			where: { username: request.params.username },
			select: ["id", "username", "email", "createdAt", "imageUrn"],
			relations: ["follows", "followers", "posts", "comments"],
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
		if (user.username !== request.params.name) {
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

const router = Router();

router.get("/:username", user, getUserSubmissions);
router.post("/:name/image", user, auth, upload.single("file"), uploadUserImage);

export default router;
