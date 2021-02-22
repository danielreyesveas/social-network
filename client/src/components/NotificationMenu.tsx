import Link from "next/link";
import { string_trunc, tempo } from "../utils";

export default function NotificationMenu({ notifications }) {
	let notificationsMarkup;

	const notificationBody = (notification) => {
		switch (notification.type) {
			case "follow":
				return (
					<>
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-4 h-4 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						ahora es tu grupi
						<span className="ml-3 text-xxs">
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
								className="w-4 h-4 ml-1 rounded-full cursor-pointer"
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
								{string_trunc(notification.post.title, 15)}
							</a>
						</Link>
						<span className="ml-3 text-xxs">
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
								className="w-4 h-4 rounded-full cursor-pointer"
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
						<span className="ml-3 text-xxs">
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
								className="w-4 h-4 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
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
								className="w-4 h-4 ml-1 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/g/${notification.sub.name}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sub.name}
							</a>
						</Link>
						<span className="ml-3 text-xxs">
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
						<span className="ml-3 text-xxs">
							{tempo(notification.createdAt)}
						</span>
					</>
				);
			default:
				return;
		}
	};

	if (notifications.length === 0) {
		notificationsMarkup = <p>Nada todavía</p>;
	} else {
		notificationsMarkup = notifications?.map((notification) => (
			<div
				className="flex items-center px-2 py-3 text-xs text-gray-500 md:flex-shrink-0"
				key={notification.identifier}
			>
				<div className="flex flex-wrap items-center">
					{notificationBody(notification)}
				</div>
			</div>
		));
	}

	return notificationsMarkup;
}
