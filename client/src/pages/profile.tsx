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
import { useUIState, useUIDispatch } from "../context";
import { GetServerSideProps } from "next";
import axios from "axios";
import Profile from "../components/Profile";
import Notifications from "../components/Notifications";
import Submissions from "../components/Submissions";

export default function ProfilePage() {
	const router = useRouter();
	const [ownProfile, setOwnProfile] = useState(false);
	const [activeTab, setActiveTab] = useState("profile");
	const { authenticated, user } = useAuthState();
	const fileInputRef = createRef<HTMLInputElement>();

	const profileData = useSelector((state: any) => state.user.profile);
	const dispatch = useDispatch();

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
		console.log(file);
		const formData = new FormData();
		formData.append("file", file);
		formData.append("username", user.username);
		console.log(formData);
		dispatch(uploadUserImage(formData));
	};

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
										<li className="flex-auto mx-2 -mb-px text-center last:mr-0">
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
												<span className="items-center justify-center hidden md:flex">
													Perfil
												</span>
												<span className="flex items-center justify-center">
													<i className="mr-1 text-base fas fa-user-astronaut"></i>
												</span>
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
												<span className="items-center justify-center hidden md:flex">
													Notificaciones
													<span className="ml-1 profile-badge">
														{
															profileData?.user
																?.notificationCount
														}
													</span>
												</span>
												<span className="flex items-center justify-center">
													<i className="mr-1 text-base fal fa-comment-music"></i>
													<span className="block profile-badge md:hidden">
														{
															profileData?.user
																?.notificationCount
														}
													</span>
												</span>
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
												<span className="items-center justify-center hidden md:flex">
													Actividad
													<span className="ml-1 profile-badge bg-primary-2 text-primary-3">
														{
															profileData
																?.submissions
																.length
														}
													</span>
												</span>
												<span className="flex items-center justify-center">
													<i className="mr-1 text-base far fa-watch-calculator"></i>
													<span className="block profile-badge md:hidden bg-primary-2 text-primary-3">
														{
															profileData
																?.submissions
																.length
														}
													</span>
												</span>
											</a>
										</li>
									</ul>
									<div
										className={classNames(
											"relative flex flex-col w-full min-w-0 mb-6 break-words bg-white rounded shadow-lg",
											{
												"bg-primary-6 shadow-none":
													activeTab === "submissions",
											}
										)}
									>
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
													<Profile />
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
													<Notifications />
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
													<Submissions />
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
