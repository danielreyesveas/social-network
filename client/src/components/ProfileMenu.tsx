import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useEffect, useState } from "react";
import { gql, useSubscription } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { useUIDispatch, useAuthDispatch } from "../context";
import { logout } from "../redux/actions/userActions";
import NotificationMenu from "./NotificationMenu";

const NEW_NOTIFICATION = gql`
	subscription newNotification {
		newNotification {
			identifier
			type
			value
			sender {
				username
				imageUrl
			}
			post {
				subName
				identifier
				title
				username
				slug
			}
			sub {
				name
				title
				username
				imageUrl
			}
			comment {
				identifier
				body
				username
			}
			createdAt
		}
	}
`;

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

	const {
		data: notificationData,
		error: notificationError,
	} = useSubscription(NEW_NOTIFICATION);

	useEffect(() => {
		if (notificationError) console.error(notificationError);

		if (notificationData) {
			const { newNotification } = notificationData;
			console.log(newNotification);
			dispatch({
				type: "SET_NEW_NOTIFICATION",
				payload: newNotification,
			});
		}
		// eslint-disable-next-line
	}, [notificationData, notificationError]);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (!profileMenuContainer.current.contains(event.target)) {
				if (!showProfileMenu) return;
				setShowProfileMenu(false);
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("click", handleOutsideClick);
		}

		if (typeof window !== "undefined") {
			return () =>
				window.removeEventListener("click", handleOutsideClick);
		}
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

		if (typeof window !== "undefined") {
			window.addEventListener("click", handleOutsideClick);
		}

		if (typeof window !== "undefined") {
			return () =>
				window.removeEventListener("click", handleOutsideClick);
		}
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

	const handleProfile = () => {
		uiDispatch("TOGGLE_NOTIFICATIONS_TAB", false);
		setShowProfileMenu(false);
		router.push("/profile");
	};

	const handleChat = () => {
		setShowProfileMenu(false);
		router.push("/chat");
	};

	const handleBookmarks = () => {
		setShowProfileMenu(false);
		router.push("/bookmarks");
	};

	const handleLogout = async () => {
		setShowProfileMenu(false);
		await dispatch<any>(logout())
			.then(() => {
				authDispatch("LOGOUT");
				if (typeof window !== "undefined") {
					window.location.reload();
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<>
			<div className="relative z-50 inline-block text-left">
				<div className="relative ml-3">
					<div>
						<button
							className="relative p-1 top-1 focus:outline-none"
							onClick={handleShowNotifications}
							ref={notificationsContainer}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="w-5 h-5"
							>
								<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
								<path d="M13.73 21a2 2 0 0 1-3.46 0" />
							</svg>
							{user.notificationCount > 0 && (
								<span className="badge">
									{user.notificationCount}
								</span>
							)}
						</button>
						<div
							className={classNames(
								"absolute z-50 w-80 pt-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 notifications-div",
								{
									block: showNotifications,
									hidden: !showNotifications,
								}
							)}
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="user-menu"
						>
							<NotificationMenu
								notifications={user.lastNotifications}
							/>

							<a
								className="block py-2 font-bold text-center text-white cursor-pointer bg-dark-3 rounded-b-md"
								onClick={handleShowAllNotifications}
							>
								{user.notificationCount > 0
									? "Ver todas"
									: "Ver anteriores"}
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className="relative inline-block text-left">
				<div className="relative ml-3">
					<div ref={profileMenuContainer}>
						<button
							className="flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-white"
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
								onClick={handleProfile}
								className="menu-item"
								role="menuitem"
							>
								Perfil
							</a>
							<a
								onClick={handleChat}
								className="menu-item"
								role="menuitem"
							>
								Chat
							</a>
							<a
								onClick={handleBookmarks}
								className="menu-item"
								role="menuitem"
							>
								Marcadores
							</a>
						</div>
						<a
							onClick={handleLogout}
							className="text-right menu-item"
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
