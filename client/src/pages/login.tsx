import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import InputGroup from "../components/InputGroup";

import { login } from "../redux/actions/userActions";

import { useAuthState, useAuthDispatch } from "../context";
import { connect } from "react-redux";

const Login = ({ login, errors }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const router = useRouter();

	const { authenticated } = useAuthState();
	const dispatch = useAuthDispatch();

	if (authenticated) router.push("/");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		await login({ username, password })
			.then((response) => {
				dispatch("LOGIN", response);
				router.back();
			})
			.catch((error) => {
				console.log(error);
			});
	};
	return (
		<div className="flex bg-primary-5">
			<Head>
				<title>Entrar</title>
			</Head>

			<div
				className="w-1/3 h-screen bg-right bg-cover"
				style={{ backgroundImage: "url('/images/clics.jpg')" }}
			></div>

			<div className="flex flex-col justify-center pl-6 pr-2">
				<div className="xs:w-50 sm:w-70">
					<h1 className="mb-2 text-lg font-medium">Entrar</h1>

					<form onSubmit={handleSubmit} noValidate>
						<InputGroup
							className="mb-2"
							type="text"
							value={username}
							setValue={setUsername}
							placeholder="Nombre de usuario"
							error={errors.username}
						/>

						<InputGroup
							className="mb-4"
							type="password"
							value={password}
							setValue={setPassword}
							placeholder="Contraseña"
							error={errors.password}
						/>

						<small className="font-medium text-primary-4">
							{errors.general}
						</small>

						<button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase border rounded border-primary-1 bg-primary-1">
							Entrar
						</button>
					</form>

					<small>
						¿Eres nuevo en Clics?
						<Link href="/register">
							<a className="ml-1 font-bold uppercase text-primary-1">
								Regístrate
							</a>
						</Link>
					</small>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	errors: state.ui.errors,
});

const mapActionsToProps = (dispatch) => ({
	login: (userData) => dispatch(login(userData)),
});

export default connect(mapStateToProps, mapActionsToProps)(Login);
