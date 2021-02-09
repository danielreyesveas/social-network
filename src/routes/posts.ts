import { Router, Request, Response } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import User from "../entities/User";

import auth from "../middleware/auth";
import user from "../middleware/user";

const createPost = async (request: Request, response: Response) => {
	const { title, body, sub } = request.body;

	const user: User = response.locals.user;

	if (title.trim() === "")
		return response.status(400).json({ title: "Campo requerido." });

	try {
		const subRecord = await Sub.findOneOrFail({ name: sub });
		const post = new Post({ title, body, user, sub: subRecord });

		await post.save();

		return response.json(post);
	} catch (error) {
		console.error(error);
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
				relations: ["sub", "votes", "comments"],
			}
		);

		if (user) {
			post.setUserVote(user);
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
	const { identifier, slug } = request.params;
	const { body } = request.body;

	try {
		const post = await Post.findOneOrFail({ identifier, slug });

		const comment = new Comment({
			body,
			user: response.locals.user,
			post,
		});

		await comment.save();

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

router.post("/", user, auth, createPost);
router.get("/", user, getPosts);
router.get("/:identifier/:slug", user, getPost);
router.post("/:identifier/:slug/comments", user, auth, commentOnPost);
router.get("/:identifier/:slug/comments", user, getPostComments);

export default router;
