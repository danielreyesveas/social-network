import Link from "next/link";
import RedditLogo from "../images/reddit.svg";

import { useAuthState, useAuthDispatch } from "../context/auth";
import axios from "axios";

const Navbar: React.FC = () => {
	const { authenticated, loading } = useAuthState();
	const dispatch = useAuthDispatch();

	const handleLogout = () => {
		axios
			.get("/auth/logout")
			.then(() => {
				dispatch("LOGOUT");
				window.location.reload();
			})
			.catch((error) => console.error(error));
	};

	return (
		<div className="fixed inset-x-0 top-0 z-10 flex items-center justify-center h-12 px-5 bg-white">
			<div className="flex items-center">
				<Link href="/">
					<a>
						<RedditLogo className="w-8 h-8 mr-2 outline-none" />
					</a>
				</Link>

				<span className="text-2xl font-semibold">
					<Link href="/">reddit</Link>
				</span>
			</div>

			<div className="flex items-center mx-auto bg-gray-100 border rounded hover:border-blue-200 hover:bg-white">
				<i className="pl-4 pr-3 text-gray-500 fas fa-search"></i>
				<input
					type="text"
					className="py-1 pr-3 rounded focus:outline-none w-160"
					placeholder="Search"
				/>
			</div>

			<div className="flex">
				{!loading &&
					(authenticated ? (
						<button
							className="mr-4 hollow blue button"
							onClick={handleLogout}
						>
							log out
						</button>
					) : (
						<>
							<Link href="/login">
								<a className="mr-4 hollow blue button">
									log in
								</a>
							</Link>

							<Link href="/register">
								<a className="blue button">sign up</a>
							</Link>
						</>
					))}
			</div>
		</div>
	);
};

export default Navbar;
