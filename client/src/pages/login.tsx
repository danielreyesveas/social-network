import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import InputGroup from "../components/InputGroup";

import { useAuthState, useAuthDispatch } from "../context/auth";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<any>({});

	const router = useRouter();

	const { authenticated } = useAuthState();
	const dispatch = useAuthDispatch();

	if (authenticated) router.push("/");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		try {
			const response = await axios.post("/auth/login", {
				username,
				password,
			});

			dispatch("LOGIN", response.data);

			router.back();
		} catch (error) {
			console.log(error);
			setErrors(error.response.data);
		}
	};
	return (
		<div className="flex bg-white">
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

					<form onSubmit={handleSubmit}>
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

						<small className="font-medium text-red-600">
							{errors.general}
						</small>

						<button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
							Entrar
						</button>
					</form>

					<small>
						¿Eres nuevo en Clics?
						<Link href="/register">
							<a className="ml-1 font-bold text-blue-500 uppercase">
								Regístrate
							</a>
						</Link>
					</small>
				</div>
			</div>
		</div>
	);
}
