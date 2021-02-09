import dayjs from "dayjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import PostCard from "../../components/PostCard";
import { Post, Comment } from "../../types";

export default function UserPage() {
	const router = useRouter();
	const username = router.query.username;

	const { data, error } = useSWR<any>(username ? `/users/${username}` : null);

	if (error) router.push("/");

	if (data) {
		console.log(data);
	}

	return (
		<>
			<Head>
				<title>{data?.user.username}</title>
			</Head>
			{data && (
				<div className="container flex pt-5">
					<div className="w-160">
						{data.submissions.map((submission: any) => {
							if (submission.type === "Post") {
								const post: Post = submission;
								return (
									<PostCard
										key={post.identifier}
										post={post}
									/>
								);
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
												<Link
													href={`/g/${comment.post.subName}`}
												>
													<a className="text-black cursor-pointer hover:underline">
														/g/
														{comment.post.subName}
													</a>
												</Link>
											</p>

											<hr />

											<p className="mt-2">
												{comment.body}
											</p>
										</div>
									</div>
								);
							}
						})}
					</div>

					<div className="ml-6 w-80">
						<div className="bg-white rounded">
							<div className="p-3 bg-blue-500 rounded-t">
								<img
									src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
									alt="user profile"
									className="w-16 h-16 mx-auto border-2 border-white rounded-full"
								/>
							</div>
							<div className="p-3 text-center">
								<h1 className="mb-4 text-xl">
									{data.user.username}
								</h1>

								<hr />
								<p className="my-3">
									<i className="mr-2 fas fa-birthday-cake"></i>
									Joined{" "}
									{dayjs(data.user.createdAt).format(
										"D MMM YYYY"
									)}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}