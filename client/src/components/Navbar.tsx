import Link from "next/link";
import Logo from "../images/clics-b.svg";

import classNames from "classnames";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Sub } from "../types";
import Image from "next/image";
import { useRouter } from "next/router";
import ProfileMenu from "./ProfileMenu";
import { connect } from "react-redux";

interface NavbarProps {
	loading?: boolean;
	authenticated?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ loading, authenticated }) => {
	const searchContainer = useRef(null);
	const [showSearch, setShowSearch] = useState(false);
	const [search, setSearch] = useState("");
	const [subs, setSubs] = useState<Sub[]>([]);
	const [timer, setTimer] = useState(null);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (!searchContainer.current.contains(event.target)) {
				if (!showSearch) return;
				setShowSearch(false);
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("click", handleOutsideClick);
		}

		if (typeof window !== "undefined") {
			return () =>
				window.removeEventListener("click", handleOutsideClick);
		}
	}, [showSearch, searchContainer]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (!showSearch) return;

			if (event.key === "Escape") {
				setShowSearch(false);
			}
		};

		document.addEventListener("keyup", handleEscape);
		return () => document.removeEventListener("keyup", handleEscape);
	}, [showSearch]);

	const router = useRouter();

	useEffect(() => {
		if (search.trim() === "") {
			setSubs([]);
			return;
		}
		setShowSearch(true);
		searchSubs();
	}, [search]);

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

	return (
		<div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-12 px-2 bg-white sm:px-5">
			{/* Logo and title */}
			<div className="flex items-center">
				<Link href="/">
					<a>
						<Logo className="w-8 h-8 sm:w-10 sm:h-10" />
					</a>
				</Link>
				<span className="hidden text-2xl font-semibold lg:block">
					<Link href="/">clics</Link>
				</span>
			</div>
			{/* Serach Input */}
			<div
				className="max-w-full px-2 sm-px-4 w-50 sm:w-160"
				ref={searchContainer}
			>
				<div className="relative flex items-center bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
					<i className="pl-4 pr-3 text-gray-500 fas fa-search"></i>
					<input
						type="text"
						className="w-full py-1 pr-3 bg-transparent rounded focus:outline-none"
						placeholder="¿Qué buscas?"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onClick={() => setShowSearch(!showSearch)}
					/>
					<div
						className={classNames(
							"absolute left-0 right-0 bg-white",
							{
								block: showSearch,
								hidden: !showSearch,
							}
						)}
						style={{ top: "100%" }}
					>
						{subs?.map((sub) => (
							<div
								key={sub.name}
								className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
								onClick={() => {
									router.push(sub.url);
									setSearch("");
								}}
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
						<ProfileMenu />
					) : (
						<>
							<Link href="/login">
								<a className="w-20 py-1 mr-4 leading-5 sm:block lg:w-32 hollow blue button">
									entrar
								</a>
							</Link>
						</>
					))}
			</div>
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	authenticated: state.user.authenticated,
	loading: state.user.loading,
});

export default connect(mapStateToProps)(Navbar);
