import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useUIDispatch, useAuthDispatch } from "../context";
import { logout } from "../redux/actions/userActions";

export default function ProfileMenu() {
	const router = useRouter();
	const user = useSelector((state: any) => state.user.credentials);
	const profileMenuContainer = useRef(null);
	const notificationsContainer = useRef(null);
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const dispatch = useDispatch();
	const authDispatch = useAuthDispatch();
	const uiDispatch = useUIDispatch();

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (!profileMenuContainer.current.contains(event.target)) {
				if (!showProfileMenu) return;
				setShowProfileMenu(false);
			}
		};

		window.addEventListener("click", handleOutsideClick);
		return () => window.removeEventListener("click", handleOutsideClick);
	}, [showProfileMenu, profileMenuContainer]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (!showProfileMenu) return;

			if (event.key === "Escape") {
				setShowProfileMenu(false);
			}
		};

		document.addEventListener("keyup", handleEscape);
		return () => document.removeEventListener("keyup", handleEscape);
	}, [showProfileMenu]);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (!notificationsContainer.current.contains(event.target)) {
				if (!showNotifications) return;
				setShowNotifications(false);
			}
		};

		window.addEventListener("click", handleOutsideClick);
		return () => window.removeEventListener("click", handleOutsideClick);
	}, [showNotifications, notificationsContainer]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (!showNotifications) return;

			if (event.key === "Escape") {
				setShowNotifications(false);
			}
		};

		document.addEventListener("keyup", handleEscape);
		return () => document.removeEventListener("keyup", handleEscape);
	}, [showNotifications]);

	const handleShow = () => {
		setShowProfileMenu(!showProfileMenu);
	};

	const handleShowNotifications = () => {
		setShowNotifications(!showNotifications);
	};

	const handleShowAllNotifications = () => {
		uiDispatch("TOGGLE_NOTIFICATIONS_TAB", true);
		setShowNotifications(false);
		router.push("/profile");
	};

	const handleProfile = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault();
		uiDispatch("TOGGLE_NOTIFICATIONS_TAB", false);
		setShowProfileMenu(false);
		router.push("/profile");
	};

	const handleChat = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault();
		setShowProfileMenu(false);
		router.push("/chat");
	};

	const handleLogout = async (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault();
		setShowProfileMenu(false);
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
							ref={notificationsContainer}
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
								"absolute right-0 z-50 w-60 pt-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100",
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
								<div
									className="flex items-center px-2 py-3 text-xs text-gray-500 md:flex-shrink-0"
									key={notification.identifier}
								>
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

							<a
								className="block py-2 font-bold text-center text-white cursor-pointer bg-dark-3 rounded-b-md"
								onClick={handleShowAllNotifications}
							>
								Ver todas
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className="relative inline-block text-left">
				<div className="relative ml-3">
					<div ref={profileMenuContainer}>
						<button
							className="flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
							id="user-menu"
							aria-haspopup="true"
							onClick={handleShow}
						>
							<span className="sr-only">Open user menu</span>
							<img
								className="w-8 h-8 rounded-full min-h-8 min-w-8"
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
							<a
								onClick={(e) => handleProfile(e)}
								href="#"
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								role="menuitem"
							>
								Perfil
							</a>
							<a
								onClick={(e) => handleChat(e)}
								href="#"
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								role="menuitem"
							>
								Chat
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
		</>
	);
}
