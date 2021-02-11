import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
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
			.json({ value: "El valor del voto debe ser -1, 0, o 1." });
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
			return response
				.status(400)
				.json({ error: "El voto no ha sido encontrado." });
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

		if (comment) {
			comment = await Comment.findOneOrFail(
				{ identifier: commentIdentifier },
				{ relations: ["votes"] }
			);

			comment.setUserVote(user);
			return response.json(comment);
		} else {
			post = await Post.findOneOrFail(
				{ identifier, slug },
				{ relations: ["comments", "comments.votes", "sub", "votes"] }
			);

			post.setUserVote(user);
			return response.json(post);
		}
	} catch (error) {
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const topSubs = async (_: Request, response: Response) => {
	try {
		const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')`;
		const subs = await getConnection()
			.createQueryBuilder()
			.select(
				`s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
			)
			.from(Sub, "s")
			.leftJoin(Post, "p", `s.name = p."subName"`)
			.groupBy('s.title, s.name, "imageUrl"')
			.orderBy(`"postCount"`, "DESC")
			.limit(5)
			.execute();
		return response.json(subs);
	} catch (error) {
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

router.post("/vote", user, auth, vote);
router.get("/top-subs", topSubs);

export default router;
