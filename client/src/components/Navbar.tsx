import Link from "next/link";
import Logo from "../images/clics-b.svg";

import { useAuthState, useAuthDispatch } from "../context/auth";
import axios from "axios";
import { useEffect, useState } from "react";
import { Sub } from "../types";
import Image from "next/image";
import { useRouter } from "next/router";

const Navbar: React.FC = () => {
	const [search, setSearch] = useState("");
	const [subs, setSubs] = useState<Sub[]>([]);
	const [timer, setTimer] = useState(null);

	const { authenticated, loading } = useAuthState();
	const dispatch = useAuthDispatch();

	const router = useRouter();

	useEffect(() => {
		if (search.trim() === "") {
			setSubs([]);
			return;
		}
		searchSubs();
	}, [search]);

	const handleLogout = () => {
		axios
			.get("/auth/logout")
			.then(() => {
				dispatch("LOGOUT");
				window.location.reload();
			})
			.catch((error) => console.error(error));
	};

	const searchSubs = async () => {
		clearTimeout(timer);
		setTimer(
			setTimeout(async () => {
				try {
					const { data } = await axios.get(`/subs/search/${search}`);
					setSubs(data);
				} catch (error) {
					console.error(error);
				}
			}, 250)
		);
	};

	const goToSub = (subName: string) => {
		router.push(`/g/${subName}`);
		setSearch("");
	};

	return (
		<div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-12 px-5 bg-white">
			{/* Logo and title */}
			<div className="flex items-center">
				<Link href="/">
					<a>
						<Logo className="w-10 h-10" />
					</a>
				</Link>
				<span className="hidden text-2xl font-semibold lg:block">
					<Link href="/">clics</Link>
				</span>
			</div>
			{/* Serach Input */}
			<div className="max-w-full px-4 w-160">
				<div className="relative flex items-center bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
					<i className="pl-4 pr-3 text-gray-500 fas fa-search "></i>
					<input
						type="text"
						className="py-1 pr-3 bg-transparent rounded focus:outline-none"
						placeholder="¿Qué buscas?"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<div
						className="absolute left-0 right-0 bg-white"
						style={{ top: "100%" }}
					>
						{subs?.map((sub) => (
							<div
								key={sub.name}
								className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
								onClick={() => goToSub(sub.name)}
							>
								<Image
									src={sub.imageUrl}
									className="rounded-full"
									alt="Sub"
									height={(8 * 16) / 4}
									width={(8 * 16) / 4}
								/>
								<div className="ml-4 text-sm">
									<p className="font-medium">{sub.name}</p>
									<p className="text-gray-600">{sub.title}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* Auth buttons */}
			<div className="flex">
				{!loading &&
					(authenticated ? (
						// Show logout
						<button
							className="hidden w-20 py-1 mr-4 leading-5 sm:block lg:w-32 hollow blue button"
							onClick={handleLogout}
						>
							salir
						</button>
					) : (
						<>
							<Link href="/login">
								<a className="hidden w-20 py-1 mr-4 leading-5 sm:block lg:w-32 hollow blue button">
									entrar
								</a>
							</Link>
							{/* <Link href="/register">
								<a className="hidden w-20 py-1 leading-5 sm:block lg:w-32 blue button">
									registro
								</a>
							</Link> */}
						</>
					))}
			</div>
		</div>
	);
};

export default Navbar;
