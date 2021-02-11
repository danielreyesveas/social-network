import classNames from "classnames";
import Link from "next/link";
import axios from "axios";

import {
	useAuthState,
	useAuthDispatch,
	useUIState,
	useUIDispatch,
} from "../context";

export default function ProfileMenu() {
	const { showProfileMenu } = useUIState();
	const { user } = useAuthState();

	const uiDispatch = useUIDispatch();
	const authDispatch = useAuthDispatch();

	const handleShow = () => {
		uiDispatch("TOGGLE_PROFILE_MENU");
	};

	const handleLogout = (e) => {
		e.preventDefault();
		authDispatch("TOGGLE_PROFILE_MENU");
		axios
			.get("/auth/logout")
			.then(() => {
				authDispatch("LOGOUT");
				window.location.reload();
			})
			.catch((error) => console.error(error));
	};

	return (
		<div className="relative inline-block text-left">
			<div className="relative ml-3">
				<div>
					<button
						className="flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
						id="user-menu"
						aria-haspopup="true"
						onClick={handleShow}
					>
						<span className="sr-only">Open user menu</span>
						<img
							className="w-8 h-8 rounded-full"
							src={user.imageUrl}
							alt=""
						/>
					</button>
				</div>

				<div
					className={classNames(
						"absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100",
						{ block: showProfileMenu, hidden: !showProfileMenu }
					)}
					role="menu"
					aria-orientation="vertical"
					aria-labelledby="user-menu"
				>
					<div className="py-1">
						<span className="block px-4 py-2 text-sm text-right text-gray-700">
							{user.username}
						</span>
					</div>
					<div className="py-1">
						<Link href={`/u/${user.username}`}>
							<a
								onClick={handleShow}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								role="menuitem"
							>
								Perfil
							</a>
						</Link>
						<a
							onClick={handleShow}
							href="#"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
							role="menuitem"
						>
							Mensajes
						</a>
					</div>
					<a
						onClick={(e) => handleLogout(e)}
						href="#"
						className="block px-4 py-2 text-sm text-right text-gray-700 hover:bg-gray-100"
						role="menuitem"
					>
						salir{" "}
						<i className="pl-1 text-gray-500 far fa-sign-out"></i>
					</a>
				</div>
			</div>
		</div>
	);
}
