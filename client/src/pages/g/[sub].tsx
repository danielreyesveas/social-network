import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, createRef, useEffect, useState } from "react";
import PostCard from "../../components/PostCard";
import Image from "next/image";
import classNames from "classnames";

import { uploadSubImage, follow } from "../../redux/actions/dataActions";
import { useAuthState } from "../../context";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { Post, Sub } from "../../types";
import Link from "next/link";

import { connect } from "react-redux";
import { useGetSub, useGetSubPosts } from "../../hooks";
import { pluralize } from "../../utils";

const SubPage = ({ sub, posts, uploadSubImage, follow }) => {
	const [ownSub, setOwnSub] = useState(false);
	const fileInputRef = createRef<HTMLInputElement>();

	const [observedPost, setObservedPost] = useState("");

	const { authenticated, user } = useAuthState();
	const router = useRouter();
	const subName = router.query.sub;

	const { data, error, page, setPage, revalidate } = useGetSubPosts(subName);
	useGetSub(subName);

	const isInitialLoading = !data && !error;

	if (error) router.push("/");

	useEffect(() => {
		if (!sub) return;
		setOwnSub(authenticated && user.username === sub.username);
	}, [sub]);

	useEffect(() => {
		if (!posts || posts.length === 0) return;

		const id = posts[posts.length - 1].identifier;

		if (id !== observedPost) {
			setObservedPost(id);
			observeElement(document.getElementById(id));
		}
	}, [posts]);

	const openFileInput = (type: string) => {
		if (!ownSub) return;
		fileInputRef.current.name = type;
		fileInputRef.current.click();
	};

	const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files[0];

		const formData = new FormData();
		formData.append("file", file);
		formData.append("type", fileInputRef.current.name);
		formData.append("subName", sub.name);

		uploadSubImage(formData);
	};

	const handleFollow = async () => {
		if (!authenticated) router.push("/login");

		let value = 1;

		if (sub.userFollow === 1) value = 0;

		follow({
			subName,
			value,
		});
	};

	const observeElement = (element: HTMLElement) => {
		if (!element) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setPage(page + 1);
					observer.unobserve(element);
				}
			},
			{ threshold: 1 }
		);
		observer.observe(element);
	};

	return (
		<div>
			<Head>
				<title>{sub?.title}</title>
			</Head>

			<>
				{/* Sub info and images */}

				<div>
					{/* Banner image */}

					{sub && (
						<>
							<input
								type="file"
								hidden={true}
								ref={fileInputRef}
								onChange={uploadImage}
							/>
							<div
								className={classNames("bg-primary-1", {
									"cursor-pointer": ownSub,
								})}
								onClick={() => openFileInput("banner")}
							>
								{sub.bannerUrl ? (
									<div
										className="h-32 md:h-20"
										style={{
											backgroundImage: `url(${sub.bannerUrl})`,
											backgroundRepeat: "no-repeat",
											backgroundSize: "cover",
											backgroundPosition: "center",
										}}
									></div>
								) : (
									<div className="h-20 sm:h-28 md:h-56 bg-dark-3"></div>
								)}
							</div>

							<div className="pl-5 h-50 sm:h-42 md:h-24 bg-primary-5">
								<div className="container relative flex">
									<div
										className="absolute "
										style={{ top: -30 }}
									>
										<Image
											src={sub.imageUrl}
											alt="Sub"
											className={classNames(
												"rounded-full",
												{
													"cursor-pointer": ownSub,
												}
											)}
											onClick={() =>
												openFileInput("image")
											}
											width={70}
											height={70}
										/>
									</div>

									<div className="pt-10 pl-6 md:pt-1 md:pl-24">
										<div className="flex items-center">
											<h1 className="mb-1 text-2xl font-bold sm:text-3xl">
												{sub.title}
											</h1>
											<div>
												{ownSub ? (
													<Link
														href={`${sub.url}/edit`}
													>
														<a className="px-4 py-1 mx-4 hollow primary button">
															editar
														</a>
													</Link>
												) : (
													<a
														className="px-4 py-1 mx-4 hollow button primary"
														onClick={handleFollow}
													>
														{!!sub.userFollow
															? "dejar"
															: "seguir"}
													</a>
												)}
											</div>
										</div>
										<p className="text-xs font-bold text-gray-500 sm:text-sm">
											{sub.url}
										</p>

										<div className="block w-full p-2 md:hidden">
											<div className="items-center sm:flex">
												<div className="flex items-center flex-shrink-0 w-1/2 sm:flex-shrink-1">
													<p className="mr-2 text-xs italic">
														{sub.description}
													</p>
												</div>

												<div className="flex w-1/2 mt-1 ml-0 text-xs font-medium sm:inline-block sm:ml-10">
													<div className="w-1/2">
														<p>
															{pluralize(
																sub.postCount,
																"entrada"
															)}
														</p>
													</div>
													<div className="w-1/2">
														<p>
															{pluralize(
																sub.followerCount,
																"grupi"
															)}
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Posts & Sidebar */}

				<div className="container flex pt-5">
					<div className="w-full px-4 md:w-160 md:p-0160">
						{isInitialLoading && (
							<p className="text-lg text-center">Cargando...</p>
						)}
						{posts.length > 0 ? (
							posts.map((post) => (
								<PostCard key={post.identifier} post={post} />
							))
						) : (
							<p className="text-lg text-center">
								Nada todavía...
							</p>
						)}
						{isInitialLoading && posts.length > 0 && (
							<p className="text-lg text-center">
								Cargando más...
							</p>
						)}
					</div>
					{sub && <Sidebar sub={sub} />}
				</div>
			</>
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	sub: state.data.sub,
	posts: state.data.posts,
});

const mapActionsToProps = {
	uploadSubImage,
	follow,
};

export default connect(mapStateToProps, mapActionsToProps)(SubPage);

// Server side render
// export const getServerSideProps: GetServerSideProps = async (_) => {
// 	try {
// 		const response = await axios.get("/posts");

// 		return { props: { posts: response.data } };
// 	} catch (error) {
// 		return { props: { error: "Something went wrong." } };
// 	}
// };
