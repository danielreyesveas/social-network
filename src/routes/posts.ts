import { Router, Request, Response } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import User from "../entities/User";

import auth from "../middleware/auth";

const createPost = async (request: Request, response: Response) => {
	const { title, body, sub } = request.body;

	const user: User = response.locals.user;

	if (title.trim() === "")
		return response.status(400).json({ title: "Must not be empty." });

	try {
		const subRecord = await Sub.findOneOrFail({ name: sub });
		const post = new Post({ title, body, user, sub: subRecord });

		await post.save();

		return response.json(post);
	} catch (error) {
		console.error(error);
		return response.status(500).json({ error: "Something went wrong." });
	}
};

const getPosts = async (_: Request, response: Response) => {
	try {
		const posts = await Post.find({
			order: { createdAt: "DESC" },
		});

		return response.json(posts);
	} catch (error) {
		console.error(error);
		return response.status(500).json({ error: "Something went wrong." });
	}
};

const getPost = async (request: Request, response: Response) => {
	const { identifier, slug } = request.params;

	try {
		const post = await Post.findOneOrFail(
			{
				identifier,
				slug,
			},
			{
				relations: ["sub"],
			}
		);

		return response.json(post);
	} catch (error) {
		console.error(error);
		return response.status(404).json({ error: "Post not found." });
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
		return response.status(404).json({ error: "Post not found." });
	}
};

const router = Router();

router.post("/", auth, createPost);
router.get("/", getPosts);
router.get("/:identifier/:slug", getPost);
router.post("/:identifier/:slug/comments", auth, commentOnPost);

export default router;
