import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import InputGroup from "../components/InputGroup";

import { useAuthState } from "../context/auth";

export default function Register() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [agreement, setAgreement] = useState(false);
	const [errors, setErrors] = useState<any>({});

	const { authenticated } = useAuthState();

	const router = useRouter();

	if (authenticated) router.push("/");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		if (!agreement) {
			setErrors({ ...errors, agreement: "You must agree to Terms." });
			return;
		}
		try {
			await axios.post("/auth/register", {
				email,
				username,
				password,
			});

			router.push("/login");
		} catch (error) {
			console.log(error);
			setErrors(error.response.data);
		}
	};
	return (
		<div className="flex bg-white">
			<Head>
				<title>Registro</title>
			</Head>

			<div
				className="h-screen bg-center bg-cover w-36"
				style={{ backgroundImage: "url('/images/bricks.jpg')" }}
			></div>

			<div className="flex flex-col justify-center pl-6">
				<div className="w-70">
					<h1 className="mb-2 text-lg font-medium">Registro</h1>

					<p className="mb-10 text-xs">
						Al continuar aceptas nuestros Términos y Condiciones.
					</p>

					<form onSubmit={handleSubmit}>
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
							<small className="block font-medium text-red-600">
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

						<button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
							Sign Up
						</button>
					</form>

					<small>
						¿Ya eres de Clics?
						<Link href="/login">
							<a className="ml-1 font-bold text-blue-500 uppercase">
								Entra
							</a>
						</Link>
					</small>
				</div>
			</div>
		</div>
	);
}
