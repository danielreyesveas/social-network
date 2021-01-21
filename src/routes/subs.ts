import { Router, Request, Response, NextFunction } from "express";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

import Sub from "../entities/Sub";
import User from "../entities/User";

import auth from "../middleware/auth";
import user from "../middleware/user";
import Post from "../entities/Post";
import { makeId } from "../utils/helpers";

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

const getSub = async (request: Request, response: Response) => {
	const name = request.params.name;

	try {
		const sub = await Sub.findOneOrFail({ name });
		const posts = await Post.find({
			where: { sub },
			order: { createdAt: "DESC" },
			relations: ["comments", "votes"],
		});

		sub.posts = posts;

		const user = response.locals.user;

		if (user) {
			sub.posts.forEach((p) => p.setUserVote(user));
		}

		return response.json(sub);
	} catch (error) {
		console.error(error);
		return response.status(404).json({ error: "Sub not found." });
	}
};

const ownSub = async (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	const user: User = response.locals.user;
	try {
		const sub = await Sub.findOneOrFail({
			where: { name: request.params.name },
		});

		if (sub.username !== user.username) {
			return response
				.status(403)
				.json({ error: "You don't own this sub." });
		}

		response.locals.sub = sub;

		return next();
	} catch (error) {
		console.error(error);
		return response.status(500).json({ error: "Something went wrong." });
	}
};

const upload = multer({
	storage: multer.diskStorage({
		destination: "public/images",
		filename: (_, file, callback) => {
			const name = makeId(15);
			callback(null, name + path.extname(file.originalname));
		},
	}),
	fileFilter: (_, file: any, callback: FileFilterCallback) => {
		if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
			callback(null, true); // Accept file
		} else {
			callback(new Error("File not an image."));
		}
	},
});

const uploadSubImage = async (request: Request, response: Response) => {
	const sub: Sub = response.locals.sub;

	try {
		const type = request.body.type;

		if (type !== "image" && type !== "banner") {
			fs.unlinkSync(request.file.path);
			return response.status(400).json({ error: "Invalid type." });
		}

		let oldImageUrn: string = "";
		if (type === "image") {
			oldImageUrn = sub.imageUrn || "";
			sub.imageUrn = request.file.filename;
		} else {
			oldImageUrn = sub.bannerUrn || "";
			sub.bannerUrn = request.file.filename;
		}

		await sub.save();

		if (oldImageUrn) {
			fs.unlinkSync(`public\\images\\${oldImageUrn}`);
		}

		return response.json(sub);
	} catch (error) {
		console.error(error);
		return response.status(500).json({ error: "Something went wrong." });
	}
};

const router = Router();

router.post("/", user, auth, createSub);
router.get("/:name", user, getSub);
router.post(
	"/:name/image",
	user,
	auth,
	ownSub,
	upload.single("file"),
	uploadSubImage
);

export default router;
