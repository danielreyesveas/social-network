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
import ActionButton from "../../components/ActionButton";

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
										className="h-14 sm:h-28 md:h-56 bg-primary-1"
										style={{
											backgroundImage: `url(${sub.bannerUrl})`,
											backgroundRepeat: "no-repeat",
											backgroundSize: "cover",
											backgroundPosition: "center",
										}}
									></div>
								) : (
									<div className="h-20 bg-dark-3"></div>
								)}
							</div>

							<div className="h-20 bg-primary-5">
								<div className="container relative flex">
									<div
										className="absolute"
										style={{ top: -15 }}
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
									<div className="pt-1 pl-24">
										<div className="flex items-center">
											<h1 className="mb-1 text-3xl font-bold">
												{sub.title}
											</h1>
											<Link href={`/g/${sub.name}/edit`}>
												<a className="px-4 py-1 mr-4 hollow blue button">
													editar
												</a>
											</Link>
											<ActionButton>
												<a
													className="px-4 py-1 mr-4 hollow blue button"
													onClick={handleFollow}
												>
													{!!sub.userFollow
														? "dejar"
														: "seguir"}
												</a>
											</ActionButton>
										</div>
										<p className="text-sm font-bold text-gray-500">
											/g/{sub.name}
										</p>
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
						{posts?.map((post) => (
							<PostCard key={post.identifier} post={post} />
						))}
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
