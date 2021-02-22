import Head from "next/head";
import { FormEvent, useEffect, useState } from "react";
import { useAuthState } from "../../../context";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useGetSub } from "../../../hooks";
import { updateSub } from "../../../redux/actions/dataActions";
import { connect } from "react-redux";
import { User } from "../../../types";
import axios from "axios";
import Image from "next/image";
import { status_text } from "../../../utils";

const EditSub = ({ sub, updateSub }) => {
	const [ownSub, setOwnSub] = useState(false);
	// Global state
	const { authenticated, user } = useAuthState();
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [members, setMembers] = useState<any[]>([]);
	const [membersNames, setMembersNames] = useState<string[]>([]);

	const [search, setSearch] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [timer, setTimer] = useState(null);

	const router = useRouter();

	const subName = router.query.sub;

	const { error } = useGetSub(subName);

	const [errors, setErrors] = useState<Partial<any>>({});

	useEffect(() => {
		if (!sub) return;

		setName(sub.name);
		setTitle(sub.title);
		setDescription(sub.description);
		setMembers(
			sub.members.map((m) => {
				return { ...m.user, status: m.status };
			})
		);
		setMembersNames(sub.members.map((m) => m.username));

		setOwnSub(authenticated && user.username === sub.username);
	}, [sub]);

	useEffect(() => {
		if (search.trim() === "") {
			setUsers([]);
			return;
		}
		searchUsers();
	}, [search]);

	const searchUsers = async () => {
		clearTimeout(timer);
		setTimer(
			setTimeout(async () => {
				try {
					const { data } = await axios.post(
						`/users/search/${search}`,
						{ membersNames }
					);
					setUsers(data);
				} catch (error) {
					console.error(error);
				}
			}, 250)
		);
	};

	const addMember = (user: User) => {
		setMembers([...members, user]);
		setMembersNames([...membersNames, user.username]);
		setSearch("");
	};

	const removeMember = (user: User) => {
		setMembers(members.filter((m) => m.username !== user.username));
		setMembersNames(membersNames.filter((m) => m !== user.username));
		setSearch("");
	};

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
			members,
		};

		updateSub(subData).then((response) => {
			console.log(response);
			router.push(response.url);
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

			<div className="flex flex-col justify-center pl-6 pr-3 mb-3">
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

						<div className="max-w-full px-2 my-6 sm-px-4 w-60 sm:w-100">
							<p className="font-medium">Miembros</p>

							<div className="my-5">
								{members ? (
									members.map((m) => (
										<div
											key={m.username}
											className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200 hover:border-primary-4 group"
											onClick={() => removeMember(m)}
										>
											<Image
												src={m.imageUrl}
												className="rounded-full"
												alt="User"
												height={(8 * 16) / 4}
												width={(8 * 16) / 4}
											/>
											<div className="flex ml-4 text-sm">
												<div className="w-2/4">
													<p className="font-medium">
														⊚{m.username}
													</p>
													<p className="text-gray-600 ">
														{m.email}
													</p>
												</div>
												{m.status ? (
													<p
														className={classNames(
															"w-1/4 font-medium text-xs",
															{
																"text-green-300":
																	m.status ===
																	"accepted",
															},
															{
																"text-primary-4":
																	m.status ===
																	"rejected",
															},
															{
																"text-yellow-400":
																	m.status ===
																	"pending",
															}
														)}
													>
														{status_text(m.status)}
													</p>
												) : (
													<p className="w-1/4 text-xs font-medium text-primary-1">
														A enviar
													</p>
												)}

												<i className="w-1/4 ml-12 opacity-0 fas fa-user-times text-primary-4 group-hover:opacity-100"></i>
											</div>
										</div>
									))
								) : (
									<p>Todavía no has invitado a nadie...</p>
								)}
							</div>

							<div className="relative flex items-center bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
								<i className="pl-4 pr-3 text-gray-500 fas fa-search"></i>
								<input
									type="text"
									className="w-full py-1 pr-3 bg-transparent rounded focus:outline-none"
									placeholder="Buscar"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
								<div
									className="absolute left-0 right-0 overflow-y-scroll bg-white max-h-52"
									style={{ top: "100%" }}
								>
									{users?.map((user) => (
										<div
											key={user.username}
											className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
											onClick={() => addMember(user)}
										>
											<Image
												src={user.imageUrl}
												className="rounded-full"
												alt="User"
												height={(8 * 16) / 4}
												width={(8 * 16) / 4}
											/>
											<div className="ml-4 text-sm">
												<p className="font-medium">
													⊚{user.username}
												</p>
												<p className="text-gray-600">
													{user.email}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
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
