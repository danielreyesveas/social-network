import Link from "next/link";
import classNames from "classnames";

import { Post } from "../types";
import ActionButton from "./ActionButton";
import { useAuthState } from "../context/auth";
import { useRouter } from "next/router";
import { tempo, pluralize, string_trunc } from "../utils";
import { vote } from "../redux/actions/dataActions";
import { connect } from "react-redux";

interface PostCardProps {
	post: Post;
	vote: Function;
}

const PostCard = ({
	post: {
		identifier,
		slug,
		title,
		body,
		subName,
		createdAt,
		voteScore,
		userVote,
		commentCount,
		url,
		username,
		sub,
	},
	vote,
}: PostCardProps) => {
	const { authenticated } = useAuthState();

	const router = useRouter();

	const isInSubPage = router.pathname === "/g/[sub]";

	const handleVote = async (value: number) => {
		if (!authenticated) return router.push("/login");

		if (value === userVote) value = 0;

		vote({
			identifier,
			slug,
			value,
		});
	};

	return (
		<div
			key={identifier}
			className="flex mb-4 bg-white rounded"
			id={identifier}
		>
			{/* Vote section */}
			<div className="w-10 py-3 text-center bg-gray-200 rounded-l">
				{/* Upvote */}
				<div
					className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
					onClick={() => handleVote(1)}
				>
					<i
						className={classNames("icon-arrow-up", {
							"text-red-500": userVote === 1,
						})}
					></i>
				</div>
				<p className="text-xs font-bold">{voteScore}</p>
				{/* Downvote */}
				<div
					className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
					onClick={() => handleVote(-1)}
				>
					<i
						className={classNames("icon-arrow-down", {
							"text-blue-600": userVote === -1,
						})}
					></i>
				</div>
			</div>
			{/* Post data section */}
			<div className="w-full p-2">
				<div className="items-center md:flex">
					{!isInSubPage && (
						<div className="flex items-center md:flex-shrink-0">
							<Link href={`/g/${subName}`}>
								<img
									src={sub.imageUrl}
									className="w-6 h-6 mr-1 rounded-full cursor-pointer"
								/>
							</Link>
							<Link href={`/g/${subName}`}>
								<a className="text-xs font-bold cursor-pointer hover:underline">
									/g/{subName}
								</a>
							</Link>
							<span className="mx-1 text-xs text-gray-500">
								•
							</span>
						</div>
					)}

					<p className="text-xs text-gray-500">
						Por
						<Link href={`/u/${username}`}>
							<a className="mx-1 hover:underline">
								/u/{username}
							</a>
						</Link>
						<Link href={url}>
							<a className="mx-1 hover:underline">
								{tempo(createdAt)}
							</a>
						</Link>
					</p>
				</div>

				<div className="mt-3">
					<Link href={url}>
						<a className="my-1 text-lg font-medium">{title}</a>
					</Link>
				</div>

				<div className="mb-3">
					{body && (
						<p className="my-1 text-sm">{string_trunc(body)}</p>
					)}
				</div>

				<div className="flex mt-3">
					<Link href={url}>
						<a>
							<ActionButton>
								<i className="mr-1 fas fa-comment-alt fa-xs"></i>
								<span className="font-bold">
									{pluralize(commentCount, "Commentario")}
								</span>
							</ActionButton>
						</a>
					</Link>
					<ActionButton>
						<i className="mr-1 fas fa-share fa-xs"></i>
						<span className="font-bold">Compartir</span>
					</ActionButton>
					<ActionButton>
						<i className="mr-1 fas fa-bookmark fa-xs"></i>
						<span className="font-bold">Marcar</span>
					</ActionButton>
				</div>
			</div>
		</div>
	);
};

const mapActionsToProps = {
	vote,
};

export default connect(null, mapActionsToProps)(PostCard);
