import Head from "next/head";

import PostCard from "../components/PostCard";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetSubs, useGetBookmarkPosts } from "../hooks";
import { Post, Sub } from "../types";

export default function Bookmarks() {
	const description = "Clics es una red social para músicos y sus leseras";
	const title = "Clics: Leseras musicales.";

	const user = useSelector((state: any) => state.user);
	const posts: Post[] = useSelector((state: any) => state.data.posts);
	const subs: Sub[] = useSelector((state: any) => state.data.subs);

	const { authenticated } = user;

	const [observedPost, setObservedPost] = useState("");

	const { data, error, page, setPage } = useGetBookmarkPosts();
	const isInitialLoading = !data && !error;

	useGetSubs();

	useEffect(() => {
		if (!posts || posts.length === 0) return;

		const id = posts[posts.length - 1].identifier;

		if (id !== observedPost) {
			setObservedPost(id);
			observeElement(document.getElementById(id));
		}
	}, [posts]);

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
		<>
			<Head>
				<title>{title}</title>
				<meta name="description" content={description} />
				<meta property="og:description" content={description} />
				<meta property="og:title" content={title} />
				<meta property="twitter:description" content={description} />
				<meta property="twitter:title" content={title} />
			</Head>

			<div className="container flex pt-4">
				<div className="w-full px-4 md:w-160 md:p-0">
					{isInitialLoading && (
						<p className="text-lg text-center">Cargando...</p>
					)}
					{posts?.map((post) => (
						<PostCard key={post.identifier} post={post} />
					))}
					{isInitialLoading && posts.length > 0 && (
						<p className="text-lg text-center">Cargando más...</p>
					)}
				</div>

				<div className="hidden ml-6 mr-4 md:block w-80">
					<div className="bg-white rounded">
						<div className="p-4 border-b-2">
							<p className="text-lg font-semibold text-center">
								Destacados
							</p>
						</div>
						<div className="border-b-2">
							{subs?.map((sub) => (
								<div
									key={sub.name}
									className="flex items-center px-4 py-2 text-xs border-b"
								>
									<Link href={sub.url}>
										<a>
											<Image
												src={sub.imageUrl}
												className="rounded-full cursor-pointer"
												alt="Sub"
												width={(6 * 16) / 4}
												height={(6 * 16) / 4}
											/>
										</a>
									</Link>
									<Link href={sub.url}>
										<a className="ml-2 font-bold hover:cursor-pointer">
											/{sub.url}
										</a>
									</Link>
									<p className="ml-auto font-med">
										{sub.postCount}
									</p>
								</div>
							))}
						</div>

						{authenticated && (
							<div className="p-4">
								<Link href="/subs/create">
									<a className="w-full px-2 py-1 blue button">
										Crea un grupo
									</a>
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
