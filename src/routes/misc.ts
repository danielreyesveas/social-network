import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import User from "../entities/User";
import Vote from "../entities/Vote";
import Follow from "../entities/Follow";
import auth from "../middleware/auth";
import user from "../middleware/user";
import Bookmark from "../entities/Bookmark";
import SubMember, { Status } from "../entities/SubMember";

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
			comment = await Comment.findOneOrFail(
				{
					identifier: commentIdentifier,
				},
				{ relations: ["post"] }
			);
			vote = await Vote.findOne(
				{ user, comment },
				{ relations: ["comment", "comment.post"] }
			);
		} else {
			vote = await Vote.findOne({ user, post }, { relations: ["post"] });
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

const bookmark = async (request: Request, response: Response) => {
	const { identifier, slug } = request.body;
	const user: User = response.locals.user;

	try {
		let post = await Post.findOneOrFail({ identifier, slug });
		let bookmark: Bookmark | undefined;

		bookmark = await Bookmark.findOne({ user, post });

		if (bookmark) {
			await bookmark.remove();
		} else {
			bookmark = new Bookmark({ user, post });
			await bookmark.save();
		}

		post = await Post.findOneOrFail(
			{ identifier, slug },
			{ relations: ["bookmarks"] }
		);

		post.setUserBookmark(user);
		return response.json(post);
	} catch (error) {
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const follow = async (request: Request, response: Response) => {
	const { subName, username, value } = request.body;
	const followTypes = [0, 1];

	if (!followTypes.includes(value)) {
		return response
			.status(400)
			.json({ value: "El valor enviado debe ser 0 o 1." });
	}

	try {
		const user: User = response.locals.user;
		let sub: Sub | undefined;
		let follow: Follow | undefined;
		let followedUser: User | undefined;

		if (subName) {
			sub = await Sub.findOneOrFail({ name: subName });
			follow = await Follow.findOne({ user, sub });
		} else {
			followedUser = await User.findOneOrFail({ username });
			follow = await Follow.findOne({ user, followedUser });
		}

		if (!follow && value === 0) {
			return response
				.status(400)
				.json({ error: "El dato no ha sido encontrado." });
		} else if (!follow) {
			if (sub) {
				follow = new Follow({ user, value });
				follow.sub = sub;
				await follow.save();
			} else if (followedUser) {
				follow = new Follow({ user, value });
				follow.followedUser = followedUser;
				await follow.save();
			}
		} else if (value === 0) {
			await follow.remove();
		} else if (follow.value !== value) {
			follow.value = value;
			await follow.save();
		}

		if (followedUser) {
			followedUser = await User.findOneOrFail(
				{ username },
				{ relations: ["followers", "followers.user"] }
			);

			followedUser.setUserFollow(user);
			return response.json(followedUser);
		} else {
			sub = await Sub.findOneOrFail(
				{ name: subName },
				{
					relations: ["followers", "followers.user"],
				}
			);

			sub.setUserFollow(user);
			return response.json(sub);
		}
	} catch (error) {
		console.log(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const responseInvitation = async (request: Request, response: Response) => {
	const { identifier, value } = request.body;
	const responseTypes = [-1, 1];

	if (!responseTypes.includes(value)) {
		return response
			.status(400)
			.json({ value: "El valor enviado debe ser -1 o 1." });
	}

	try {
		const subMember = await SubMember.findOne(
			{ identifier },
			{ relations: ["sub"] }
		);

		if (!subMember) {
			return response
				.status(400)
				.json({ error: "El dato no ha sido encontrado." });
		}

		const status = value === 1 ? Status.ACEPTED : Status.REJECTED;
		subMember.status = status;
		await subMember.save();

		return response.json(subMember);
	} catch (error) {
		console.log(error);
		return response
			.status(500)
			.json({ error: "Algo no ha salido bien..." });
	}
};

const topSubs = async (_: Request, response: Response) => {
	try {
		const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y')`;
		const url = `CONCAT('g/',s."name")`;
		const subs = await getConnection()
			.createQueryBuilder()
			.select(
				`s.title, s.name, ${url} as "url", ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
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
router.post("/bookmark", user, auth, bookmark);
router.post("/follow", user, auth, follow);
router.post("/response-invitation", user, auth, responseInvitation);
router.get("/top-subs", topSubs);

export default router;
