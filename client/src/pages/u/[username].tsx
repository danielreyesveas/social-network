import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";
import { User } from "../../types";
import PostCard from "../../components/PostCard";
import { Post, Comment } from "../../types";
import axios from "axios";
import { ChangeEvent, createRef, useEffect, useState } from "react";
import { useAuthState } from "../../context";
import { useGetUserData } from "../../hooks";
import { uploadUserImage } from "../../redux/actions/dataActions";

import dayjs from "dayjs";
import { connect } from "react-redux";

const UserPage = ({ userData, uploadUserImage }) => {
	const router = useRouter();
	const username = router.query.username;
	const [ownProfile, setOwnProfile] = useState(false);
	const { authenticated, user } = useAuthState();
	const fileInputRef = createRef<HTMLInputElement>();

	const { error } = useGetUserData(username);

	if (error) router.push("/");

	useEffect(() => {
		if (!userData) return;
		setOwnProfile(
			authenticated && user.username === userData.user.username
		);
	}, [userData]);

	const openFileInput = () => {
		if (!ownProfile) return;
		fileInputRef.current.click();
	};
	console.log(userData);
	const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files[0];

		const formData = new FormData();
		formData.append("file", file);
		formData.append("username", user.username);

		uploadUserImage(formData);
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
				<>
					<input
						type="file"
						hidden={true}
						ref={fileInputRef}
						onChange={uploadImage}
					/>
					<div className="container flex pt-5">
						<div className="w-160">{submissionsMarkup}</div>

						<div className="ml-6 w-80">
							<div className="bg-white rounded">
								<div className="p-3 rounded-t bg-dark-3">
									<img
										alt="user profile"
										src={userData.user.imageUrl}
										className={classNames(
											"w-16 h-16 mx-auto border-2 border-white rounded-full",
											{
												"cursor-pointer": ownProfile,
											}
										)}
										onClick={() => openFileInput()}
									/>
								</div>
								<div className="p-3 text-center">
									<h1 className="mb-4 text-xl">
										{userData.user.username}
									</h1>

									<hr />

									<p className="my-3">
										{userData.user.email}
									</p>

									<p className="my-3">
										<i className="mr-2 fas fa-birthday-cake"></i>
										Se unió el{" "}
										{dayjs(userData.user.createdAt).format(
											"D MMM YYYY"
										)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
};

const mapStateToProps = (state: any) => ({
	userData: state.data.userData,
});

const mapActionsToProps = {
	uploadUserImage,
};

export default connect(mapStateToProps, mapActionsToProps)(UserPage);
