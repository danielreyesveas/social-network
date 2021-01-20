import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import InputGroup from "../components/InputGroup";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<any>({});

	const router = useRouter();

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		try {
			await axios.post("/auth/login", {
				username,
				password,
			});

			router.push("/");
		} catch (error) {
			console.log(error);
			setErrors(error.response.data);
		}
	};
	return (
		<div className="flex bg-white">
			<Head>
				<title>Login</title>
			</Head>

			<div
				className="h-screen bg-center bg-cover w-36"
				style={{ backgroundImage: "url('/images/bricks.jpg')" }}
			></div>

			<div className="flex flex-col justify-center pl-6">
				<div className="w-70">
					<h1 className="mb-2 text-lg font-medium">Login</h1>

					<form onSubmit={handleSubmit}>
						<InputGroup
							className="mb-2"
							type="text"
							value={username}
							setValue={setUsername}
							placeholder="Username"
							error={errors.username}
						/>

						<InputGroup
							className="mb-4"
							type="password"
							value={password}
							setValue={setPassword}
							placeholder="Password"
							error={errors.password}
						/>

						<small className="font-medium text-red-600">
							{errors.general}
						</small>

						<button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
							Login
						</button>
					</form>

					<small>
						New to Reddit?
						<Link href="/register">
							<a className="ml-1 font-bold text-blue-500 uppercase">
								Register
							</a>
						</Link>
					</small>
				</div>
			</div>
		</div>
	);
}
