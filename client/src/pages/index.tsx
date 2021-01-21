import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Link from "next/link";
import { GetServerSideProps } from "next";

import { Post } from "../types";
import PostCard from "../components/PostCard";

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
						<PostCard key={post.identifier} post={post} />
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
