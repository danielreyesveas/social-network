import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { FormEvent, useState } from "react";
import classNames from "classnames";
import { useRouter } from "next/router";

export default function CreateSub() {
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [errors, setErrors] = useState<Partial<any>>({});

	const router = useRouter();

	const submitCreate = async (event: FormEvent) => {
		event.preventDefault();

		try {
			const response = await axios.post("/subs", {
				name,
				title,
				description,
			});
			router.push(`/g/${response.data.name}`);
		} catch (error) {
			console.error(error);
			setErrors(error.response.data);
		}
	};

	return (
		<div className="flex bg-primary-5">
			<Head>
				<title>Crea un grupo</title>
			</Head>

			<div
				className="h-screen bg-left bg-cover sm:w-1/3"
				style={{ backgroundImage: "url('/images/clics.jpg')" }}
			></div>

			<div className="flex flex-col justify-center pl-6 pr-3">
				<div className="xs:w-70 sm:w-98">
					<h1 className="mb-2 text-lg font-medium">Crea un Grupo</h1>

					<hr />

					<form onSubmit={submitCreate}>
						<div className="my-6">
							<p className="font-medium">Nombre</p>
							<p className="mb-2 text-xs text-gray-500">
								Los nombres de los grupos no podrán modificarse.
							</p>
							<input
								type="text"
								className={classNames(
									"w-full p-3 border border-gray-200 rounded hover:border-gray-500",
									{ "border-primary-4": errors.name }
								)}
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
							<small className="font-medium text-primary-4">
								{errors.name}
							</small>
						</div>

						<div className="my-6">
							<p className="font-medium">Título</p>
							<p className="mb-2 text-xs text-gray-500">
								El título representa todo lo que este grupo
								representa para ti.
							</p>
							<input
								type="text"
								className={classNames(
									"w-full p-3 border border-gray-200 rounded hover:border-gray-500",
									{ "border-primary-4": errors.title }
								)}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
							<small className="font-medium text-primary-4">
								{errors.title}
							</small>
						</div>

						<div className="my-6">
							<p className="font-medium">Descripción</p>
							<p className="mb-2 text-xs text-gray-500">
								Ayúdanos a entender tu grupo.
							</p>
							<textarea
								className={classNames(
									"w-full p-3 border border-gray-200 rounded hover:border-gray-500",
									{ "border-primary-4": errors.description }
								)}
								value={description}
								rows={4}
								onChange={(e) => setDescription(e.target.value)}
							></textarea>
							<small className="font-medium text-primary-4">
								{errors.description}
							</small>
						</div>

						<div className="flex justify-end">
							<button className="px-4 py-1 primary button">
								Crear
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

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
