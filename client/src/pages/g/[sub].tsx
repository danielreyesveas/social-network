import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, createRef, useEffect, useState } from "react";
import PostCard from "../../components/PostCard";
import Image from "next/image";
import classNames from "classnames";

import { Post, Sub } from "../../types";
import { useAuthState } from "../../context";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { connect } from "react-redux";
import { useGetSub } from "../../hooks";

const SubPage = ({ sub }) => {
	// Local state
	const [ownSub, setOwnSub] = useState(false);
	// Global state
	const { authenticated, user } = useAuthState();
	// Utils
	const router = useRouter();
	const fileInputRef = createRef<HTMLInputElement>();

	const subName = router.query.sub;

	const { error } = useGetSub(subName);

	useEffect(() => {
		if (!sub) return;
		setOwnSub(authenticated && user.username === sub.username);
	}, [sub]);

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

		try {
			await axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
		} catch (err) {
			console.log(err);
		}
	};

	if (error) router.push("/");

	let postsMarkup;
	if (!sub) {
		postsMarkup = <p className="text-lg text-center">Cargando..</p>;
	} else if (sub.posts.length === 0) {
		postsMarkup = <p className="text-lg text-center">Nada todavía...</p>;
	} else {
		postsMarkup = sub.posts.map((post: Post) => (
			<PostCard key={post.identifier} post={post} />
		));
	}

	return (
		<div>
			<Head>
				<title>{sub?.title}</title>
			</Head>

			{sub && (
				<>
					<input
						type="file"
						hidden={true}
						ref={fileInputRef}
						onChange={uploadImage}
					/>
					{/* Sub info and images */}
					<div>
						{/* Banner image */}
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
						{/* Sub meta data */}
						<div className="h-20 bg-primary-5">
							<div className="container relative flex">
								<div className="absolute" style={{ top: -15 }}>
									<Image
										src={sub.imageUrl}
										alt="Sub"
										className={classNames("rounded-full", {
											"cursor-pointer": ownSub,
										})}
										onClick={() => openFileInput("image")}
										width={70}
										height={70}
									/>
								</div>
								<div className="pt-1 pl-24">
									<div className="flex items-center">
										<h1 className="mb-1 text-3xl font-bold">
											{sub.title}
										</h1>
									</div>
									<p className="text-sm font-bold text-gray-500">
										/g/{sub.name}
									</p>
								</div>
							</div>
						</div>
					</div>
					{/* Posts & Sidebar */}
					<div className="container flex pt-5">
						<div className="w-full px-4 md:w-160 md:p-0160">
							{postsMarkup}
						</div>
						<Sidebar sub={sub} />
					</div>
				</>
			)}
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	sub: state.data.sub,
});

export default connect(mapStateToProps)(SubPage);
