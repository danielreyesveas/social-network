import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { Post, Sub } from "../../../types";
import { useGetSub } from "../../../hooks";
import { connect } from "react-redux";
import { addPost } from "../../../redux/actions/dataActions";

const Submit = ({ sub, addPost }) => {
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");

	const router = useRouter();
	const { sub: subName } = router.query;

	const { error } = useGetSub(subName);

	if (error) router.push("/");

	const submitPost = (event: FormEvent) => {
		event.preventDefault();

		if (title.trim() == "") return;

		const postData = {
			title: title.trim(),
			body,
			sub: subName,
		};

		addPost(postData).then((response) => {
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
						Nueva entrada en /g/{subName}
					</h1>
					<form onSubmit={submitPost}>
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

			{sub && <Sidebar sub={sub} />}
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	sub: state.data.sub,
});

const mapActionsToProps = (dispatch) => ({
	addPost: (postData) => dispatch(addPost(postData)),
});

export default connect(mapStateToProps, mapActionsToProps)(Submit);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	try {
		const cookie = req.headers.cookie;
		if (!cookie) throw new Error("Missing auth token cookie.");
		await axios.get("/auth/me", { headers: { cookie } });
		return { props: {} };
	} catch (error) {
		console.error(error);
		res.writeHead(307, { Location: "/login" }).end();
	}
};
