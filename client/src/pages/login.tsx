import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import InputGroup from "../components/InputGroup";

import { login, loginWithGoogle } from "../redux/actions/userActions";
import app, { googleAuthProvider } from "../firebase/config";

import { useAuthState, useAuthDispatch } from "../context";
import { connect } from "react-redux";

const Login = ({ login, loginWithGoogle, errors }) => {
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
				dispatch("LOGIN", response).then(() => router.back());
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const socialLogin = async (provider) => {
		await app
			.auth()
			.signInWithPopup(provider)
			.then(async (result) => {
				const { displayName, email, photoURL } = result.user;
				console.log(result);
				console.log(displayName, email, photoURL);
				await loginWithGoogle({ displayName, email, photoURL })
					.then((response) => {
						console.log(response);
						dispatch("LOGIN", response).then(() => router.back());
					})
					.catch((err) => {
						console.log(err);
					});
			})
			.catch((error) => {
				console.log(error.message);
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

					<button
						className="w-full py-2 mb-4 text-xs font-bold text-white uppercase border rounded border-primary-1 bg-primary-1"
						onClick={() => socialLogin(googleAuthProvider)}
					>
						Google
					</button>

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
	loginWithGoogle: (userData) => dispatch(loginWithGoogle(userData)),
});

export default connect(mapStateToProps, mapActionsToProps)(Login);
