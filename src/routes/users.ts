import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import User from "../entities/User";

import user from "../middleware/user";

const getUserSubmissions = async (request: Request, response: Response) => {
	try {
		const user = await User.findOneOrFail({
			where: { username: request.params.username },
			select: ["username", "createdAt"],
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

router.get("/:username", user, getUserSubmissions);

export default router;
