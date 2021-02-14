import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import Sidebar from "../../../../../components/Sidebar";
import { Post, Sub } from "../../../../../types";
import { useAuthState } from "../../../../../context/auth";
import { useGetSub, useGetPost } from "../../../../../hooks";
import { connect } from "react-redux";
import { updatePost } from "../../../../../redux/actions/dataActions";

const EditPost = ({ sub, post, updatePost }) => {
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");

	const { authenticated, user } = useAuthState();

	const router = useRouter();
	const { sub: subName, identifier, slug } = router.query;

	const { error } = useGetPost(identifier, slug);

	useGetSub(subName);

	if (error) router.push("/");

	useEffect(() => {
		if (!post) return;
		setTitle(post.title);
		setBody(post.body);
	}, [post]);

	const handleUpdatePost = (event: FormEvent) => {
		event.preventDefault();

		if (title.trim() == "") return;

		const postData = {
			identifier,
			slug,
			title: title.trim(),
			body,
			sub: subName,
		};

		updatePost(postData).then((response) => {
			console.log(response);
			router.push(
				`/g/${sub.name}/${response.identifier}/${response.slug}`
			);
		});
	};

	return (
		<div className="container flex pt-5">
			<Head>
				<title>Aporta a Clics</title>
			</Head>
			<div className="w-160">
				<div className="p-4 bg-white rounded">
					<h1 className="mb-3 text-lg">
						Editar entrada en {sub?.url}
					</h1>
					<form onSubmit={handleUpdatePost}>
						<div className="relative mb-2">
							<input
								type="text"
								className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
								placeholder="Título"
								maxLength={300}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
							<div
								className="absolute mb-2 text-sm text-gray-500 select-none"
								style={{ top: 11, right: 10 }}
							>
								{title.trim().length}/300
							</div>
						</div>

						<textarea
							className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
							value={body}
							placeholder="Contenido (opcional)"
							rows={20}
							onChange={(e) => setBody(e.target.value)}
						></textarea>

						<div className="flex justify-end">
							<button
								className="px-3 py-1 blue button"
								type="submit"
								disabled={title.trim().length === 0}
							>
								Guardar
							</button>
						</div>
					</form>
				</div>
			</div>

			{sub && <Sidebar sub={sub} hideCreate={true} />}
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	sub: state.data.sub,
	post: state.data.post,
});

const mapActionsToProps = (dispatch) => ({
	updatePost: (postData) => dispatch(updatePost(postData)),
});

export default connect(mapStateToProps, mapActionsToProps)(EditPost);
