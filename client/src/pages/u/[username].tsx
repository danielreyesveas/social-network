import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import PostCard from "../../components/PostCard";
import { Post, Comment } from "../../types";

import { useEffect, useState } from "react";
import { useAuthState } from "../../context";
import { useGetUserData } from "../../hooks";
import { follow } from "../../redux/actions/dataActions";

import dayjs from "dayjs";
import { connect } from "react-redux";
import { pluralize } from "../../utils";

const UserPage = ({ userData, follow }) => {
	const router = useRouter();
	const username = router.query.username;
	const [ownProfile, setOwnProfile] = useState(false);
	const { authenticated, user } = useAuthState();

	const { error } = useGetUserData(username);

	if (error) router.push("/");

	useEffect(() => {
		if (!userData) return;
		setOwnProfile(
			authenticated && user.username === userData.user.username
		);
	}, [userData]);

	const handleFollow = async () => {
		if (!authenticated) router.push("/login");

		let value = 1;

		if (userData.user.userFollow === 1) value = 0;

		follow({
			username,
			value,
		});
	};

	let submissionsMarkup;

	if (!userData) {
		submissionsMarkup = <p className="text-lg text-center">Cargando..</p>;
	} else if (userData.submissions.length === 0) {
		submissionsMarkup = (
			<p className="text-lg text-center">Nada todavía...</p>
		);
	} else {
		submissionsMarkup = userData.submissions.map((submission: any) => {
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
	}

	return (
		<>
			<Head>
				<title>{userData?.user.username}</title>
			</Head>
			{userData && (
				<div className="container flex pt-5">
					<div className="w-160">{submissionsMarkup}</div>

					<div className="hidden ml-6 w-80 md:block">
						<div className="bg-white rounded">
							<div className="p-3 rounded-t bg-dark-3">
								<img
									alt="user profile"
									src={userData.user.imageUrl}
									className="w-16 h-16 mx-auto border-2 border-white rounded-full"
								/>
							</div>
							<div className="p-3 text-center">
								<h1 className="mb-4 text-xl">
									{userData.user.username}
								</h1>

								<hr />

								<p className="my-3">{userData.user.email}</p>

								<p className="mb-3 text-md linebreaks">
									{userData.user.bio}
								</p>
								<div className="flex mb-3 text-sm font-medium">
									<div className="w-1/2">
										<p>{userData.user.postCount}</p>
										<p>
											{pluralize(
												userData.user.postCount,
												"entrada",
												false
											)}
										</p>
									</div>
									<div className="w-1/2">
										<p>{userData.user.followerCount}</p>
										<p>
											{pluralize(
												userData.user.followerCount,
												"grupi",
												false
											)}
										</p>
									</div>
								</div>

								{userData.user.followersPreview.length > 0 && (
									<div className="my-5">
										<h2 className="text-center">Grupis</h2>

										<div className="-space-x-4">
											{userData.user.followersPreview.map(
												(follower) => (
													<img
														key={follower.username}
														className="relative inline object-cover w-10 h-10 border-2 border-white rounded-full cursor-pointer profile-image"
														onClick={() =>
															router.push(
																follower.user
																	.url
															)
														}
														src={
															follower.user
																.imageUrl
														}
														alt="Profile image"
													/>
												)
											)}
										</div>
									</div>
								)}

								<p className="my-3">
									<i className="mr-2 fas fa-birthday-cake"></i>
									Se unió el{" "}
									{dayjs(userData.user.createdAt).format(
										"D MMM YYYY"
									)}
								</p>

								{!ownProfile && (
									<a
										className="px-4 py-1 mt-4 hollow primary button"
										onClick={handleFollow}
									>
										{!!userData.user.userFollow
											? "dejar"
											: "seguir"}
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const mapStateToProps = (state: any) => ({
	userData: state.data.userData,
});

const mapActionsToProps = {
	follow,
};

export default connect(mapStateToProps, mapActionsToProps)(UserPage);
