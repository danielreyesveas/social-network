import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";

import PostCard from "../components/PostCard";
import { Post, Comment } from "../types";

import { ChangeEvent, createRef, useEffect, useState } from "react";
import { useAuthState } from "../context";
import { useGetUserProfileData } from "../hooks";
import { uploadUserImage } from "../redux/actions/dataActions";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { pluralize } from "../utils";
import { useUIState, useUIDispatch } from "../context";

export default function ProfilePage() {
	const router = useRouter();
	const [ownProfile, setOwnProfile] = useState(false);
	const [activeTab, setActiveTab] = useState("profile");
	const { authenticated, user } = useAuthState();
	const fileInputRef = createRef<HTMLInputElement>();
	const profileData = useSelector((state: any) => state.user.profile);
	const { showNotificationsTab } = useUIState();
	const uiDispatch = useUIDispatch();

	const { error } = useGetUserProfileData();

	if (error) router.push("/");

	useEffect(() => {
		if (showNotificationsTab) {
			setActiveTab("notifications");
			uiDispatch("TOGGLE_NOTIFICATIONS_TAB", false);
		}
	}, []);

	useEffect(() => {
		if (!profileData) return;
		setOwnProfile(
			authenticated && user.username === profileData.user.username
		);
	}, [profileData]);

	const openFileInput = () => {
		if (!ownProfile) return;
		fileInputRef.current.click();
	};

	const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files[0];

		const formData = new FormData();
		formData.append("file", file);
		formData.append("username", user.username);

		uploadUserImage(formData);
	};

	let submissionsMarkup, notificationsMarkup, profileMarkup;

	if (!profileData) {
		submissionsMarkup = notificationsMarkup = profileMarkup = (
			<p className="text-lg text-center">Cargando..</p>
		);
	} else if (profileData.submissions.length === 0) {
		submissionsMarkup = notificationsMarkup = profileMarkup = (
			<p className="text-lg text-center">Nada todavía...</p>
		);
	} else {
		submissionsMarkup = profileData.submissions.map((submission: any) => {
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
		notificationsMarkup = profileData?.user?.lastNotifications.map(
			(notification: any) => {
				return (
					<div
						className="flex items-center px-2 py-3 text-xs text-gray-500 md:flex-shrink-0"
						key={notification.identifier}
					>
						A
						<Link href={`/u/${notification.sendername}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-6 h-6 mx-1 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sendername}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sendername}
							</a>
						</Link>
						le caes mal
					</div>
				);
			}
		);
		profileMarkup = (
			<div className="p-3 text-center">
				<div className="flex mb-3 text-sm font-medium">
					<div className="w-1/2">
						<p>{profileData.user.postCount}</p>
						<p>
							{pluralize(
								profileData.user.postCount,
								"entrada",
								false
							)}
						</p>
					</div>
					<div className="w-1/2">
						<p>{profileData.user.followerCount}</p>
						<p>
							{pluralize(
								profileData.user.followerCount,
								"grupi",
								false
							)}
						</p>
					</div>
				</div>

				{profileData.user.membersPreview.length > 0 && (
					<div className="my-5">
						<h2 className="text-center">Miembro</h2>

						{profileData.user.membersPreview.map((member) => (
							<div
								key={member.subName}
								className="flex items-center cursor-pointer hover:bg-gray-200 hover:border-primary-4 group"
								onClick={() => router.push(member.sub.url)}
							>
								<img
									src={member.sub.imageUrl}
									className="relative z-30 inline object-cover w-12 h-12 border-2 border-white rounded-full"
									alt="User"
								/>
								<div className="ml-2 text-sm">
									<p className="text-xs font-medium">
										{member.sub.url}
									</p>
								</div>
							</div>
						))}
					</div>
				)}

				{profileData.user.followersPreview.length > 0 && (
					<div className="my-5">
						<h2 className="text-center">Grupis</h2>

						<div className="-space-x-4">
							{profileData.user.followersPreview.map(
								(follower) => (
									<img
										key={follower.username}
										className="relative inline object-cover w-10 h-10 border-2 border-white rounded-full cursor-pointer profile-image"
										onClick={() =>
											router.push(follower.user.url)
										}
										src={follower.user.imageUrl}
										alt="Profile image"
									/>
								)
							)}
						</div>
					</div>
				)}
				<p className="my-3">
					<i className="mr-2 fas fa-birthday-cake"></i>
					Te uniste el{" "}
					{dayjs(profileData.user.createdAt).format("D MMM YYYY")}
				</p>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Profile: ⊚{profileData?.user.username}</title>
			</Head>
			{profileData && (
				<>
					<input
						type="file"
						hidden={true}
						ref={fileInputRef}
						onChange={uploadImage}
					/>
					<div className="container flex pt-5">
						<div className="w-160">
							<div className="flex flex-wrap" id="tabs-id">
								<div className="w-full">
									<ul className="flex flex-row flex-wrap pt-3 pb-4 mb-0 list-none">
										<li className="flex-auto mr-2 -mb-px text-center last:mr-0">
											<a
												className={classNames(
													"block px-5 py-3 text-xs font-bold leading-normal uppercase rounded shadow-lg cursor-pointer bg-white",
													{
														"text-white bg-dark-3":
															activeTab ===
															"profile",
													}
												)}
												onClick={() =>
													setActiveTab("profile")
												}
											>
												Perfil{" "}
												<i className="mr-1 text-base fas fa-user-astronaut"></i>
											</a>
										</li>
										<li className="flex-auto mr-2 -mb-px text-center last:mr-0">
											<a
												className={classNames(
													"block px-5 py-3 text-xs font-bold leading-normal uppercase rounded shadow-lg cursor-pointer bg-white",
													{
														"text-white bg-dark-3":
															activeTab ===
															"notifications",
													}
												)}
												onClick={() =>
													setActiveTab(
														"notifications"
													)
												}
											>
												Notificaciones{" "}
												<i className="mr-1 text-base fal fa-comment-music"></i>
											</a>
										</li>
										<li className="flex-auto mr-2 -mb-px text-center last:mr-0">
											<a
												className={classNames(
													"block px-5 py-3 text-xs font-bold leading-normal uppercase rounded shadow-lg cursor-pointer bg-white",
													{
														"text-white bg-dark-3":
															activeTab ===
															"submissions",
													}
												)}
												onClick={() =>
													setActiveTab("submissions")
												}
											>
												Actividad{" "}
												<i className="mr-1 text-base far fa-watch-calculator"></i>
											</a>
										</li>
									</ul>
									<div className="relative flex flex-col w-full min-w-0 mb-6 break-words bg-white rounded shadow-lg">
										<div className="flex-auto px-4 py-5">
											<div className="tab-content tab-space">
												<div
													className={classNames({
														block:
															activeTab ===
															"profile",
														hidden:
															activeTab !==
															"profile",
													})}
												>
													{profileMarkup}
												</div>
												<div
													className={classNames({
														block:
															activeTab ===
															"notifications",
														hidden:
															activeTab !==
															"notifications",
													})}
												>
													{notificationsMarkup}
												</div>
												<div
													className={classNames({
														block:
															activeTab ===
															"submissions",
														hidden:
															activeTab !==
															"submissions",
													})}
												>
													{submissionsMarkup}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="hidden ml-6 w-80 md:block">
							<div className="bg-white rounded">
								<div className="p-3 rounded-t bg-dark-3">
									<img
										alt="user profile"
										src={profileData.user.imageUrl}
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
									<h1 className="mb-4 text-xl font-semibold">
										⊚{profileData.user.username}
									</h1>

									<hr />

									<p className="my-3">
										{profileData.user.email}
									</p>

									<p className="mx-3 text-sm linebreaks">
										{profileData.user.bio}
									</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
