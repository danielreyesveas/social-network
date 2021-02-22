import Link from "next/link";
import { useSelector } from "react-redux";
import { Comment, Post } from "../types";
import { string_trunc, tempo } from "../utils";
import PostCard from "./PostCard";

export default function Submissions() {
	const profile = useSelector((state: any) => state.user.profile);
	let submissionsMarkup;

	if (profile?.submissions) {
		submissionsMarkup = profile.submissions.map((submission: any) => {
			if (submission.type === "Post") {
				const post: Post = submission;
				return <PostCard key={post.identifier} post={post} />;
			} else {
				const comment: Comment = submission;
				return (
					<div
						key={comment.identifier}
						className="flex my-4 bg-white rounded"
					>
						<div className="flex-shrink-0 w-10 py-4 text-center bg-gray-200 rounded-l">
							<i className="text-gray-400 fas fa-comment-alt fa-xs"></i>
						</div>
						<div className="w-full p-2">
							<p className="mb-2 text-xs text-gray-500">
								{comment.username}
								<span> ha comentado en </span>
								<Link href={comment.post.url}>
									<a className="font-semibold cursor-pointer hover:underline">
										{comment.post.title}
									</a>
								</Link>
								<span className="mx-1">•</span>
								<Link href={`/g/${comment.post.subName}`}>
									<a className="text-black cursor-pointer hover:underline">
										/g/
										{comment.post.subName}
									</a>
								</Link>
							</p>

							<hr />

							<p className="mt-2">{comment.body}</p>
						</div>
					</div>
				);
			}
		});
	} else {
		submissionsMarkup = <p>Nada todavía...</p>;
	}

	return submissionsMarkup;
}
