import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { responseInvitation } from "../redux/actions/userActions";
import { string_trunc, tempo } from "../utils";

export default function Notifications() {
	const dispatch = useDispatch();
	const profile = useSelector((state: any) => state.user.profile);

	const handleInvitation = (identifier, value) => {
		dispatch(responseInvitation({ identifier, value }));
	};

	const notificationBody = (notification) => {
		switch (notification.type) {
			case "follow":
				return (
					<>
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-8 h-8 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						ahora es tu grupi
						<span className="ml-6 text-xs">
							{tempo(notification.createdAt)}
						</span>
					</>
				);
			case "vote":
				return (
					<>
						A
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-8 h-8 ml-2 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						le agrada {notification.comment && "tu comentario en"}
						<Link
							href={`/g/${notification.subName}/${notification.post.identifier}/${notification.post.slug}`}
						>
							<a className="mx-1 italic font-semibold hover:underline">
								{string_trunc(notification.post.title, 35)}
							</a>
						</Link>
						<span className="ml-6 text-xs">
							{tempo(notification.createdAt)}
						</span>
					</>
				);
			case "comment":
				return (
					<>
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-8 h-8 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						ha comentado en
						<Link
							href={`/g/${notification.subName}/${notification.post.identifier}/${notification.post.slug}`}
						>
							<a className="mx-1 italic font-semibold hover:underline">
								{string_trunc(notification.post.title, 15)}
							</a>
						</Link>
						<span className="ml-6 text-xs">
							{tempo(notification.createdAt)}
						</span>
					</>
				);
			case "subMember":
				return (
					<>
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-8 h-8 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-2 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						{notification.value === "accepted"
							? "ha aceptado tu invitación a unirse a"
							: notification.value === "rejected"
							? "ha rechazado tu invitación a unirse a"
							: "te ha invitado a unirte a"}
						<Link href={`/g/${notification.sub.name}`}>
							<img
								src={notification.sub.imageUrl}
								className="w-8 h-8 ml-2 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/g/${notification.sub.name}`}>
							<a className="mr-2 font-semibold hover:underline">
								/u/{notification.sub.name}
							</a>
						</Link>
						<span className="ml-6 text-xxs">
							{tempo(notification.createdAt)}
						</span>
					</>
				);
			case "sub":
				return (
					<>
						¡Ahora perteneces a
						<Link href={`/g/${notification.sub.name}`}>
							<img
								src={notification.sub.imageUrl}
								className="w-4 h-4 ml-1 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/g/${notification.sub.name}`}>
							<a className="font-semibold hover:underline">
								/u/{notification.sub.name}
							</a>
						</Link>
						!
						<span className="ml-6 text-xxs">
							{tempo(notification.createdAt)}
						</span>
					</>
				);
			default:
				return;
		}
	};

	let invitationMarkup, notificationMarkup;

	if (profile?.user?.allNotifications.length > 0) {
		notificationMarkup = profile.user.allNotifications.map(
			(notification: any) => {
				return (
					<div
						className="flex items-center px-2 py-3 text-sm text-gray-500 md:flex-shrink-0"
						key={notification.identifier}
					>
						<div className="flex flex-wrap items-center">
							{notificationBody(notification)}
						</div>
					</div>
				);
			}
		);
	} else {
		notificationMarkup = <p>Nada todavía...</p>;
	}

	if (profile?.user?.invitations.length > 0) {
		invitationMarkup = (
			<>
				<h2>Invitaciones</h2>
				{profile.user.invitations.map((invitation: any) => (
					<div
						className="flex items-center px-2 py-3 text-sm text-gray-500 md:flex-shrink-0"
						key={invitation.identifier}
					>
						<div className="flex flex-wrap items-center">
							<Link href={`/g/${invitation.sub.name}`}>
								<img
									src={invitation.sub.imageUrl}
									className="w-8 h-8 rounded-full cursor-pointer"
								/>
							</Link>
							<Link href={`/g/${invitation.sub.name}`}>
								<a className="mr-2 font-semibold hover:underline">
									/u/{invitation.sub.name}
								</a>
							</Link>
							<a
								className="px-2 py-1 mx-2 hollow primary button"
								onClick={() =>
									handleInvitation(invitation.identifier, 1)
								}
							>
								aceptar
							</a>
							<a
								className="px-2 py-1 mx-2 hollow reject button"
								onClick={() =>
									handleInvitation(invitation.identifier, -1)
								}
							>
								rechazar
							</a>
						</div>
					</div>
				))}
			</>
		);
	}

	return (
		<>
			{invitationMarkup}
			{notificationMarkup}
		</>
	);
}
