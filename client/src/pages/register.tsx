import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import InputGroup from "../components/InputGroup";

import { useAuthState, useAuthDispatch } from "../context/auth";

export default function Register() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [agreement, setAgreement] = useState(false);
	const [errors, setErrors] = useState<any>({});

	const dispatch = useAuthDispatch();

	const { authenticated } = useAuthState();

	const router = useRouter();

	if (authenticated) router.push("/");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		if (!agreement) {
			setErrors({
				...errors,
				agreement: "Debes aceptar los términos y condiciones.",
			});
			return;
		}
		try {
			const response = await axios.post("/auth/register", {
				email,
				username,
				password,
			});

			dispatch("LOGIN", response.data);

			router.push("/");
		} catch (error) {
			console.log(error);
			setErrors(error.response.data);
		}
	};
	return (
		<div className="flex bg-primary-5">
			<Head>
				<title>Registro</title>
			</Head>

			<div
				className="w-1/3 h-screen bg-center bg-cover"
				style={{ backgroundImage: "url('/images/clics.jpg')" }}
			></div>

			<div className="flex flex-col justify-center pl-6 pr-2">
				<div className="xs:w-50 sm:w-70">
					<h1 className="mb-2 text-lg font-medium">Registro</h1>

					<p className="mb-10 text-xs">
						Al continuar aceptas nuestros Términos y Condiciones.
					</p>

					<form onSubmit={handleSubmit} noValidate>
						<div className="mb-6">
							<input
								type="checkbox"
								className="mr-1 cursor-pointer"
								id="agreement"
								checked={agreement}
								onChange={(e) => setAgreement(e.target.checked)}
							/>
							<label
								htmlFor="agreement"
								className="text-xs cursor-pointer"
							>
								Acepto recibir leseras de Clics
							</label>
							<small className="block font-medium text-primary-4">
								{errors.agreement}
							</small>
						</div>

						<InputGroup
							className="mb-2"
							type="email"
							value={email}
							setValue={setEmail}
							placeholder="Correo"
							error={errors.email}
						/>

						<InputGroup
							className="mb-2"
							type="text"
							value={username}
							setValue={setUsername}
							placeholder="Nombre de Usuario"
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

						<button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase border rounded bg-primary-1 border-primary-1">
							Registrarse
						</button>
					</form>

					<small>
						¿Ya eres de Clics?
						<Link href="/login">
							<a className="ml-1 font-bold uppercase text-primary-1">
								Entra
							</a>
						</Link>
					</small>
				</div>
			</div>
		</div>
	);
}
