import axios from "axios";
import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { useAuthState } from "../../../context";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useGetSub } from "../../../hooks";
import { updateSub } from "../../../redux/actions/dataActions";
import { connect } from "react-redux";

const EditSub = ({ sub, updateSub }) => {
	const [ownSub, setOwnSub] = useState(false);
	// Global state
	const { authenticated, user } = useAuthState();
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const router = useRouter();

	const subName = router.query.sub;

	const { error } = useGetSub(subName);

	const [errors, setErrors] = useState<Partial<any>>({});

	useEffect(() => {
		if (!sub) return;
		setName(sub.name);
		setTitle(sub.title);
		setDescription(sub.description);

		setOwnSub(authenticated && user.username === sub.username);
	}, [sub]);

	const submitUpdate = async (event: FormEvent) => {
		event.preventDefault();
		if (!ownSub) return;

		if (
			name.trim() === "" ||
			title.trim() === "" ||
			description.trim() === ""
		)
			return;

		const subData = {
			name: name.trim(),
			title: title.trim(),
			description: description.trim(),
		};

		updateSub(subData).then((response) => {
			console.log(response);
			router.push(`/g/${response.name}`);
		});
	};

	if (error) router.push("/");

	return (
		<div className="flex bg-primary-5">
			<Head>
				<title>Edita tu grupo</title>
			</Head>

			<div
				className="h-screen bg-left bg-cover sm:w-1/3"
				style={{ backgroundImage: "url('/images/clics.jpg')" }}
			></div>

			<div className="flex flex-col justify-center pl-6 pr-3">
				<div className="xs:w-70 sm:w-98">
					<h1 className="mb-2 text-lg font-medium">Edita tu Grupo</h1>

					<hr />

					<form onSubmit={submitUpdate}>
						<div className="my-6">
							<p className="font-medium">Nombre</p>
							<p className="mb-2 text-xs text-gray-500">
								Los nombres de los grupos no pueden modificarse.
							</p>
							<input
								type="text"
								className={classNames(
									"w-full p-3 border border-gray-200 rounded hover:border-gray-500",
									{ "border-primary-4": errors.name }
								)}
								value={name}
								readOnly
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
								Guardar
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	sub: state.data.sub,
});

const mapActionsToProps = (dispatch) => ({
	updateSub: (subData) => dispatch(updateSub(subData)),
});

export default connect(mapStateToProps, mapActionsToProps)(EditSub);
