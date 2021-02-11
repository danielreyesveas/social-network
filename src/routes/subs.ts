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

		if (isEmpty(name)) errors.name = "Campo requerido.";
		if (isEmpty(title)) errors.title = "Campo requerido.";

		const sub = await getRepository(Sub)
			.createQueryBuilder("sub")
			.where("lower(sub.name) = :name", { name: name.toLowerCase() })
			.getOne();

		if (sub) errors.name = "El grupo ya existe.";

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
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
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
		return response
			.status(404)
			.json({ error: "El Grupo no ha sido encontrado." });
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
				.json({ error: "No perteneces a este grupo." });
		}

		response.locals.sub = sub;

		return next();
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
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
			callback(new Error("El archivo no es una imagen."));
		}
	},
});

const updateSub = async (request: Request, response: Response) => {
	const sub: Sub = response.locals.sub;

	try {
		const { title, description } = request.body;
		sub.title = title;
		sub.description = description;
		await sub.save();

		return response.json(sub);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const uploadSubImage = async (request: Request, response: Response) => {
	const sub: Sub = response.locals.sub;

	try {
		const type = request.body.type;

		if (type !== "image" && type !== "banner") {
			fs.unlinkSync(request.file.path);
			return response
				.status(400)
				.json({ error: "Tipo de archivo no permitido." });
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
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const searchSubs = async (request: Request, response: Response) => {
	try {
		const name = request.params.name;
		if (isEmpty(name)) {
			return response
				.status(400)
				.json({ error: "La búsqueda no puede estar vacía." });
		}

		const subs = await getRepository(Sub)
			.createQueryBuilder()
			.where("LOWER(name) LIKE :name", {
				name: `%${name.toLowerCase().trim()}%`,
			})
			.getMany();

		return response.json(subs);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const router = Router();

router.post("/", user, auth, createSub);
router.post("/:name/update", user, auth, ownSub, updateSub);
router.get("/:name", user, getSub);
router.get("/search/:name", searchSubs);
router.post(
	"/:name/image",
	user,
	auth,
	ownSub,
	upload.single("file"),
	uploadSubImage
);

export default router;
