import { Router, Request, Response } from "express";
import { getRepository, In } from "typeorm";
import Bookmark from "../entities/Bookmark";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import User from "../entities/User";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

import { makeId } from "../utils/helpers";
import auth from "../middleware/auth";
import user from "../middleware/user";

const upload = multer({
	storage: multer.diskStorage({
		destination: "public/images/posts",
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

const createPost = async (request: Request, response: Response) => {
	const { title, body, sub } = request.body;

	const user: User = response.locals.user;

	if (title.trim() === "") {
		if (request.file) fs.unlinkSync(request.file.path);
		return response.status(400).json({ title: "Campo requerido." });
	}

	try {
		const subRecord = await Sub.findOneOrFail({ name: sub });
		const filename = request.file ? request.file.filename : "";
		const post = new Post({
			title,
			body,
			user,
			sub: subRecord,
			imageUrn: filename,
		});

		await post.save();

		return response.json(post);
	} catch (error) {
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const getPosts = async (request: Request, response: Response) => {
	const currentPage: number = (request.query.page || 0) as number;
	const postsPerPage: number = (request.query.count || 8) as number;

	try {
		const user = response.locals.user;

		const posts = await Post.find({
			order: { createdAt: "DESC" },
			relations: ["comments", "votes", "sub", "bookmarks"],
			skip: currentPage * postsPerPage,
			take: postsPerPage,
		});

		if (user) {
			posts.forEach((p) => {
				p.setUserVote(user);
				p.setUserBookmark(user);
			});
		}

		return response.json(posts);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const getBookmarkPosts = async (request: Request, response: Response) => {
	const currentPage: number = (request.query.page || 0) as number;
	const postsPerPage: number = (request.query.count || 8) as number;

	try {
		const user = response.locals.user;
		let posts: Post[] = [];

		const userBookmarks = await Bookmark.find({
			select: ["postId"],
			where: { user },
			skip: currentPage * postsPerPage,
			take: postsPerPage,
		});

		if (userBookmarks) {
			const ids = userBookmarks.map((b) => b.postId);
			posts = await Post.find({
				where: { id: In(ids) },
				order: { createdAt: "DESC" },
				relations: ["comments", "votes", "sub", "bookmarks"],
			});
			posts.forEach((p) => {
				p.setUserVote(user);
				p.setUserBookmark(user);
			});
		}

		return response.json(posts);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const getPost = async (request: Request, response: Response) => {
	const { identifier, slug } = request.params;
	const user = response.locals.user;

	try {
		const post = await Post.findOneOrFail(
			{
				identifier,
				slug,
			},
			{
				relations: [
					"sub",
					"sub.followers",
					"sub.followers.user",
					"sub.user",
					"sub.members",
					"sub.members.user",
					"sub.posts",
					"votes",
					"comments",
					"bookmarks",
				],
			}
		);

		if (user) {
			post.setUserVote(user);
			post.setUserBookmark(user);
		}

		return response.json(post);
	} catch (error) {
		console.error(error);
		return response
			.status(404)
			.json({ error: "El Post no ha sido encontrado." });
	}
};

const updatePost = async (request: Request, response: Response) => {
	const user = response.locals.user;
	const { identifier, slug } = request.params;
	const { title, body } = request.body;

	try {
		const post = await Post.findOneOrFail({ identifier, slug });

		if (post.username !== user.username) {
			if (request.file) fs.unlinkSync(request.file.path);
			return response
				.status(403)
				.json({ error: "No puedes editar este Post." });
		}

		let oldImageUrn: string = "";
		oldImageUrn = post.imageUrn || "";

		post.imageUrn = request.file ? request.file.filename : "";
		post.title = title;
		post.body = body;

		await post.save();

		if (oldImageUrn) {
			fs.unlinkSync(`public\\images\\posts\\${oldImageUrn}`);
		}

		return response.json(post);
	} catch (error) {
		console.error(error);
		return response
			.status(404)
			.json({ error: "El Post no ha sido encontrado." });
	}
};

const commentOnPost = async (request: Request, response: Response) => {
	const user = response.locals.user;
	const { identifier, slug } = request.params;
	const { body } = request.body;

	try {
		const post = await Post.findOneOrFail({ identifier, slug });

		const comment = new Comment({
			body,
			user,
			post,
		});

		await comment.save();

		comment.voteScore;

		return response.json(comment);
	} catch (error) {
		console.error(error);
		return response
			.status(404)
			.json({ error: "El Post no ha sido encontrado." });
	}
};

const getPostComments = async (request: Request, response: Response) => {
	const user = response.locals.user;
	const { identifier, slug } = request.params;

	try {
		const post = await Post.findOneOrFail({ identifier, slug });
		const comments = await Comment.find({
			where: { post },
			order: { createdAt: "DESC" },
			relations: ["votes"],
		});

		if (user) {
			comments.forEach((c) => c.setUserVote(user));
		}

		return response.json(comments);
	} catch (error) {
		console.error(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const router = Router();

router.post("/", user, auth, upload.single("file"), createPost);
router.get("/", user, getPosts);
router.get("/bookmarks", user, auth, getBookmarkPosts);
router.get("/:identifier/:slug", user, getPost);
router.post(
	"/:identifier/:slug/update",
	user,
	auth,
	upload.single("file"),
	updatePost
);
router.post("/:identifier/:slug/comments", user, auth, commentOnPost);
router.get("/:identifier/:slug/comments", user, getPostComments);

export default router;
