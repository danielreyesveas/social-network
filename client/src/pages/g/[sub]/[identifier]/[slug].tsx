import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import classNames from "classnames";
import { Comment } from "../../../../types";
import Sidebar from "../../../../components/Sidebar";
import { useAuthState } from "../../../../context/auth";

import ActionButton from "../../../../components/ActionButton";
import { FormEvent, useEffect, useState } from "react";
import { tempo, pluralize } from "../../../../utils";
import { connect } from "react-redux";
import { useGetPost, useGetComments } from "../../../../hooks";
import { addComment, vote } from "../../../../redux/actions/dataActions";

const PostPage = ({ post, comments, addComment, vote }) => {
	// Local state
	const [description, setDescription] = useState("");
	const [newComment, setNewComment] = useState("");

	// Global state
	const { authenticated, user } = useAuthState();

	// Utils
	const router = useRouter();
	const { identifier, sub, slug } = router.query;

	const { error } = useGetPost(identifier, slug);
	useGetComments(identifier, slug);

	if (error) router.push("/");

	useEffect(() => {
		if (!post) return;
		let desc = post.body || post.title;
		desc = desc.substr(0, 158).concat("..");
		setDescription(desc);
	}, [post]);

	const handleVote = async (value: number, comment?: Comment) => {
		// If not logged in go to login
		if (!authenticated) router.push("/login");

		// If vote is the same reset vote
		if (
			(!comment && value === post.userVote) ||
			(comment && value === comment.userVote)
		)
			value = 0;

		vote({
			identifier,
			commentIdentifier: comment?.identifier,
			slug,
			value,
		});
	};

	const submitComment = async (event: FormEvent) => {
		event.preventDefault();
		if (newComment.trim() === "") return;

		try {
			addComment({ identifier, slug, comment: { body: newComment } });
			setNewComment("");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<Head>
				<title>{post?.title}</title>
				<meta name="description" content={description} />
				<meta property="og:description" content={description} />
				<meta property="og:title" content={post?.title} />
				<meta property="twitter:description" content={description} />
				<meta property="twitter:title" content={post?.title} />
			</Head>
			<Link href={`/g/${sub}`}>
				<a>
					<div className="flex items-center w-full h-20 p-8 bg-blue-500">
						<div className="container flex">
							{post && (
								<div className="w-8 h-8 mr-2 overflow-hidden rounded-full">
									<Image
										src={post.sub.imageUrl}
										height={(8 * 16) / 4}
										width={(8 * 16) / 4}
									/>
								</div>
							)}
							<p className="text-xl font-semibold text-white">
								/g/{sub}
							</p>
						</div>
					</div>
				</a>
			</Link>
			<div className="container flex pt-5">
				{/* Post */}
				<div className="w-full px-4 md:w-160 md:p-0">
					<div className="bg-white rounded">
						{post && (
							<>
								<div className="flex">
									{/* Vote section */}
									<div className="w-10 py-2 text-center rounded-l flex-srhink-0">
										{/* Upvote */}
										<div
											className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
											onClick={() => handleVote(1)}
										>
											<i
												className={classNames(
													"icon-arrow-up",
													{
														"text-red-500":
															post.userVote === 1,
													}
												)}
											></i>
										</div>
										<p className="text-xs font-bold">
											{post.voteScore}
										</p>
										{/* Downvote */}
										<div
											className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
											onClick={() => handleVote(-1)}
										>
											<i
												className={classNames(
													"icon-arrow-down",
													{
														"text-blue-600":
															post.userVote ===
															-1,
													}
												)}
											></i>
										</div>
									</div>
									<div className="py-2 pr-2">
										<div className="flex items-center">
											<p className="text-xs text-gray-500">
												Por
												<Link
													href={`/u/${post.username}`}
												>
													<a className="mx-1 hover:underline">
														/u/{post.username}
													</a>
												</Link>
												<Link href={post.url}>
													<a className="mx-1 hover:underline">
														{tempo(post.createdAt)}
													</a>
												</Link>
											</p>
										</div>
										{/* Post title */}
										<h1 className="my-1 mt-3 text-xl font-medium">
											{post.title}
										</h1>
										<Link href={`${post.url}/edit`}>
											<a className="px-4 py-1 mr-4 hollow blue button">
												editar
											</a>
										</Link>
										{/* Post body */}
										<p className="my-3 mt-3 text-sm linebreaks">
											{post.body}
										</p>
										{/* Actions */}
										<div className="flex mt-3">
											<Link href={post.url}>
												<a>
													<ActionButton>
														<i className="mr-1 fas fa-comment-alt fa-xs"></i>
														<span className="font-bold">
															{pluralize(
																post.commentCount,
																"Comentario"
															)}
														</span>
													</ActionButton>
												</a>
											</Link>
											<ActionButton>
												<i className="mr-1 fas fa-share fa-xs"></i>
												<span className="font-bold">
													Compartir
												</span>
											</ActionButton>
											<ActionButton>
												<i className="mr-1 fas fa-bookmark fa-xs"></i>
												<span className="font-bold">
													Marcar
												</span>
											</ActionButton>
										</div>
									</div>
								</div>

								{/* Comments input area */}
								<div className="pl-10 pr-6 mb-4">
									{authenticated ? (
										<div>
											<p className="mb-1 text-xs">
												Comenta como{" "}
												<Link
													href={`/u/${user.username}`}
												>
													<a className="font-semibold text-blue-500">
														{user.username}
													</a>
												</Link>
											</p>
											<form onSubmit={submitComment}>
												<textarea
													className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
													onChange={(e) =>
														setNewComment(
															e.target.value
														)
													}
													value={newComment}
												></textarea>
												<div className="flex justify-items-end">
													<button
														className="px-3 py-1 blue button"
														disabled={
															newComment.trim() ===
															""
														}
													>
														Comentar
													</button>
												</div>
											</form>
										</div>
									) : (
										<div className="flex items-center justify-between px-2 py-4 border border-gray-200 rounded">
											<p className="font-semibold text-gray-400">
												Debes entrar para poder
												comentar.
											</p>
											<div>
												<Link href="/login">
													<a className="px-4 py-1 mr-4 hollow blue button">
														entrar
													</a>
												</Link>
												{/* <Link href="/register">
													<a className="px-4 py-1 blue button">
														registro
													</a>
												</Link> */}
											</div>
										</div>
									)}
								</div>

								<hr />

								{/* Comments feed */}

								{comments?.map((comment) => (
									<div
										className="flex"
										key={comment.identifier}
									>
										{/* Vote section */}
										<div className="w-10 py-2 text-center rounded-l flex-srhink-0">
											{/* Upvote */}
											<div
												className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
												onClick={() =>
													handleVote(1, comment)
												}
											>
												<i
													className={classNames(
														"icon-arrow-up",
														{
															"text-red-500":
																comment.userVote ===
																1,
														}
													)}
												></i>
											</div>
											<p className="text-xs font-bold">
												{comment.voteScore}
											</p>
											{/* Downvote */}
											<div
												className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
												onClick={() =>
													handleVote(-1, comment)
												}
											>
												<i
													className={classNames(
														"icon-arrow-down",
														{
															"text-blue-600":
																comment.userVote ===
																-1,
														}
													)}
												></i>
											</div>
										</div>

										<div className="py-2 pr-2">
											<p className="mb-1 text-xs leading-none">
												<Link href="{`/u/${comment.username}`">
													<a className="mr-1 fold-bold hover:underline">
														{comment.username}
													</a>
												</Link>
												<span className="text-gray-600">
													{`
															${pluralize(comment.voteScore, "voto")}
															 •
															${tempo(comment.createdAt)}
														`}
												</span>
											</p>
											<p>{comment.body}</p>
										</div>
									</div>
								))}
							</>
						)}
					</div>
				</div>
				{/* Sidebar */}
				{post && <Sidebar sub={post.sub} />}
			</div>
		</>
	);
};

const mapStateToProps = (state: any) => ({
	post: state.data.post,
	comments: state.data.comments,
});

const mapActionsToProps = {
	addComment,
	vote,
};

export default connect(mapStateToProps, mapActionsToProps)(PostPage);
