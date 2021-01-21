import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import User from "../entities/User";
import Vote from "../entities/Vote";
import auth from "../middleware/auth";
import user from "../middleware/user";

const router = Router();

const vote = async (request: Request, response: Response) => {
	const { identifier, slug, commentIdentifier, value } = request.body;
	const voteTypes = [-1, 0, 1];

	if (!voteTypes.includes(value)) {
		return response
			.status(400)
			.json({ value: "Value must be -1, 0, or 1." });
	}

	try {
		const user: User = response.locals.user;
		let post = await Post.findOneOrFail({ identifier, slug });
		let vote: Vote | undefined;
		let comment: Comment | undefined;

		if (commentIdentifier) {
			comment = await Comment.findOneOrFail({
				identifier: commentIdentifier,
			});
			vote = await Vote.findOne({ user, comment });
		} else {
			vote = await Vote.findOne({ user, post });
		}

		if (!vote && value === 0) {
			// If no vote and value = 0, return error (no vote to reset)
			return response.status(400).json({ error: "Vote not found." });
		} else if (!vote) {
			// If no vote, create a new vote
			vote = new Vote({ user, value });

			if (comment) vote.comment = comment;
			else vote.post = post;

			await vote.save();
		} else if (value === 0) {
			// If vote exists and value = 0, remove it
			await vote.remove();
		} else if (vote.value !== value) {
			// If vote and value has changed, update it
			vote.value = value;
			await vote.save();
		}

		post = await Post.findOneOrFail(
			{ identifier, slug },
			{ relations: ["comments", "comments.votes", "sub", "votes"] }
		);

		post.setUserVote(user);
		post.comments.forEach((c) => c.setUserVote(user));

		return response.json(post);
	} catch (error) {
		return response.status(500).json({ error: "Something went wrong." });
	}
};

router.post("/vote", user, auth, vote);

export default router;
