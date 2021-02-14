import { Router, Request, Response, NextFunction } from "express";
import { isEmpty } from "class-validator";
import { Connection, getConnection, getRepository } from "typeorm";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

import Sub from "../entities/Sub";
import User from "../entities/User";
import Notification from "../entities/Notification";

import auth from "../middleware/auth";
import user from "../middleware/user";
import Post from "../entities/Post";
import { makeId } from "../utils/helpers";
import SubMember, { Status } from "../entities/SubMember";

const createSub = async (request: Request, response: Response) => {
	const { name, title, description, members } = request.body;

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

		// TODO: trigger function
		if (members.length) {
			members.map(async (member: string) => {
				const notification = new Notification({
					username: member,
					type: "invitation",
					sender: user,
					sub,
				});
				const subMember = new SubMember({
					username: member,
					sub,
				});
				await notification.save();
				await subMember.save();
			});
		}

		return response.json(sub);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const getSubPosts = async (request: Request, response: Response) => {
	const name = request.params.name;
	const currentPage: number = (request.query.page || 0) as number;
	const postsPerPage: number = (request.query.count || 8) as number;

	try {
		console.log(name);
		const user = response.locals.user;

		const posts = await Post.find({
			where: { subName: name },
			order: { createdAt: "DESC" },
			relations: ["comments", "votes", "sub"],
			skip: currentPage * postsPerPage,
			take: postsPerPage,
		});

		if (user) {
			posts.forEach((p) => p.setUserVote(user));
		}

		return response.json(posts);
	} catch (error) {
		console.error(error);
		return response
			.status(404)
			.json({ error: "El Grupo no ha sido encontrado." });
	}
};

const getSub = async (request: Request, response: Response) => {
	const name = request.params.name;

	try {
		const user = response.locals.user;

		const sub = await Sub.findOneOrFail(
			{ name },
			{
				relations: [
					"followers",
					"followers.user",
					"user",
					"posts",
					"posts.user",
					"members",
					"members.user",
				],
			}
		);

		if (user) {
			sub.setUserFollow(user);
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
			relations: ["members"],
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
		const { title, description, members } = request.body;
		sub.title = title;
		sub.description = description;
		await sub.save();

		// TODO: trigger function
		if (members.length) {
			const user: User = response.locals.user;
			const currentMembers = sub.members.map((m) => m.username);
			const addedMembers = members.map((m: any) => m.username);
			console.log(currentMembers);
			const deletedMembers = currentMembers.filter(
				(m: string) => !addedMembers.includes(m)
			);
			const newMembers = addedMembers.filter(
				(m: string) => !currentMembers.includes(m)
			);
			const modifiedMembers = members.filter((m: any) =>
				currentMembers.includes(m.username)
			);
			let readdedMembers: any[] = [];
			modifiedMembers.filter(function (m: any) {
				return sub.members.filter(function (c: any) {
					if (
						m.username === c.username &&
						c.status === "rejected" &&
						!m.status
					) {
						readdedMembers.push(m.username);
					}
				});
			});

			newMembers.map(async (member: string) => {
				const notification = new Notification({
					username: member,
					type: "invitation",
					sender: user,
					sub,
				});
				const subMember = new SubMember({
					username: member,
					sub,
				});
				await notification.save();
				await subMember.save();
			});

			if (deletedMembers.length) {
				deletedMembers.map(async (member: string) => {
					const notification = new Notification({
						username: member,
						type: "deletion",
						sender: user,
						sub,
					});
					await notification.save();
				});
				await getConnection()
					.createQueryBuilder()
					.delete()
					.from(SubMember)
					.where("username IN (:...deletedMembers)", {
						deletedMembers,
					})
					.execute();
			}

			if (readdedMembers.length) {
				readdedMembers.map((member: string) => {
					const notification = new Notification({
						username: member,
						type: "reinvitation",
						sender: user,
						sub,
					});
					notification.save();
				});
				await getConnection()
					.createQueryBuilder()
					.update(SubMember)
					.set({ status: Status.PENDING })
					.where("username IN (:...readdedMembers)", {
						readdedMembers,
					})
					.execute();
			}
		}

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
			.limit(10)
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
router.get("/:name", user, getSub);
router.get("/:name/posts", user, getSubPosts);
router.post("/:name/update", user, auth, ownSub, updateSub);
router.get("/search/:name", user, searchSubs);
router.post(
	"/:name/image",
	user,
	auth,
	ownSub,
	upload.single("file"),
	uploadSubImage
);

export default router;
