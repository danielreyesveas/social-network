import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Link from "next/link";
import { Post } from "../types";
import { GetServerSideProps } from "next";

dayjs.extend(relativeTime);

export default function Home() {
	const [posts, setPosts] = useState<Post[]>([]);

	useEffect(() => {
		axios
			.get("/posts")
			.then((response) => setPosts(response.data))
			.catch((error) => console.log(error));
	}, []);

	return (
		<div className="pt-12">
			<Head>
				<title>Reddit: The front page of the internerd.</title>
			</Head>

			<div className="container flex pt-4">
				<div className="w-160">
					{posts.map((post) => (
						<div
							key={post.identifier}
							className="flex mb-4 bg-white rounded"
						>
							<div className="w-10 text-center bg-gray-200 rounded-l">
								<p>V</p>
							</div>

							<div className="w-full p-2">
								<div className="flex items-center">
									<Link href={`/r/${post.subName}`}>
										<>
											<img
												src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
												className="w-6 h-6 mr-1 rounded-full cursor-pointer"
											/>
											<a className="text-xs font-bold cursor-pointer hover:underline">
												/r/{post.subName}
											</a>
										</>
									</Link>

									<p className="text-xs text-gray-600">
										<span className="mx-1">•</span>
										Posted by
										<Link href={`/u/${post.username}`}>
											<a className="mx-1 hover:underline">
												/u/{post.username}
											</a>
										</Link>
										<Link href={`/r/${post.url}`}>
											<a className="mx-1 hover:underline">
												{dayjs(
													post.createdAt
												).fromNow()}
											</a>
										</Link>
									</p>
								</div>

								<Link href={post.url}>
									<a className="my-1 text-lg font-medium">
										{post.title}
									</a>
								</Link>
								{post.body && (
									<p className="my-1 text-sm">{post.body}</p>
								)}

								<div className="flex">
									<Link href={post.url}>
										<a>
											<div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
												<i className="mr-1 fas fa-comment-alt fa-xs"></i>
												<span className="font-bold">
													20 Comments
												</span>
											</div>
										</a>
									</Link>

									<div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
										<i className="mr-1 fas fa-share fa-xs"></i>
										<span className="font-bold">Share</span>
									</div>

									<div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
										<i className="mr-1 fas fa-bookmark fa-xs"></i>
										<span className="font-bold">Save</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// Server side render
// export const getServerSideProps: GetServerSideProps = async (_) => {
// 	try {
// 		const response = await axios.get("/posts");

// 		return { props: { posts: response.data } };
// 	} catch (error) {
// 		return { props: { error: "Something went wrong." } };
// 	}
// };
