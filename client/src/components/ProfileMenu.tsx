import classNames from "classnames";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { useUIState, useUIDispatch, useAuthDispatch } from "../context";
import { logout } from "../redux/actions/userActions";
import { connect } from "react-redux";

export default function ProfileMenu() {
	const user = useSelector((state: any) => state.user.credentials);

	const dispatch = useDispatch();

	const { showProfileMenu, showNotifications } = useUIState();

	const uiDispatch = useUIDispatch();
	const authDispatch = useAuthDispatch();

	const handleShow = () => {
		uiDispatch("TOGGLE_PROFILE_MENU");
	};

	const handleShowNotifications = () => {
		uiDispatch("TOGGLE_NOTIFICATIONS");
	};

	const handleLogout = async (e) => {
		e.preventDefault();
		uiDispatch("TOGGLE_PROFILE_MENU");
		dispatch(logout());
		authDispatch("LOGOUT");
	};

	return (
		<>
			<div className="relative z-50 inline-block text-left">
				<div className="relative ml-3">
					<div>
						<button
							className="relative p-1"
							onClick={handleShowNotifications}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="w-4 h-4"
							>
								<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
								<path d="M13.73 21a2 2 0 0 1-3.46 0" />
							</svg>
							<span className="badge">
								{user.lastNotifications.length}
							</span>
						</button>
						<div
							className={classNames(
								"absolute right-0 z-50 w-60 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100",
								{
									block: showNotifications,
									hidden: !showNotifications,
								}
							)}
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="user-menu"
						>
							{user.lastNotifications?.map((notification) => (
								<div className="flex items-center px-2 py-3 text-xs text-gray-500 md:flex-shrink-0">
									A
									<Link
										href={`/u/${notification.sendername}`}
									>
										<img
											src={notification.sender.imageUrl}
											className="w-6 h-6 mx-1 rounded-full cursor-pointer"
										/>
									</Link>
									<Link
										href={`/u/${notification.sendername}`}
									>
										<a className="mr-1 font-semibold hover:underline">
											/u/{notification.sendername}
										</a>
									</Link>
									le caes mal
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

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
							"absolute right-0 w-48 py-1 mt-2 z-50 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100",
							{ block: showProfileMenu, hidden: !showProfileMenu }
						)}
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="user-menu"
					>
						<div className="py-1">
							<span className="block px-4 py-2 text-sm text-right text-gray-700">
								⊚{user.username}
							</span>
						</div>
						<div className="py-1">
							<Link href={user.url}>
								<a
									onClick={handleShow}
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									role="menuitem"
								>
									Perfil
								</a>
							</Link>
							<Link href="/chat">
								<a
									onClick={handleShow}
									href="#"
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									role="menuitem"
								>
									Chat
								</a>
							</Link>
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
		</>
	);
}
