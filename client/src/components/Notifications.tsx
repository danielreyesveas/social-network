import Link from "next/link";
import { tempo } from "../utils";

export default function Notifications({ notifications }) {
	let notificationsMarkup;

	const notificationBody = (notification) => {
		switch (notification.type) {
			case "follow":
				return (
					<>
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-6 h-6 mx-1 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						ahora es tu grupi {tempo(notification.createdAt)}
					</>
				);
			case "vote":
				return (
					<>
						A
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-6 h-6 mx-1 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						le agrada{" "}
						{notification.comment ? "tu comentario" : "tu post"}{" "}
						{tempo(notification.createdAt)}
					</>
				);
			case "comment":
				return (
					<>
						<Link href={`/u/${notification.sender.username}`}>
							<img
								src={notification.sender.imageUrl}
								className="w-6 h-6 mx-1 rounded-full cursor-pointer"
							/>
						</Link>
						<Link href={`/u/${notification.sender.username}`}>
							<a className="mr-1 font-semibold hover:underline">
								/u/{notification.sender.username}
							</a>
						</Link>
						ha commentado {tempo(notification.createdAt)}
					</>
				);
			default:
				return <p>{notification.type}</p>;
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
				{notificationBody(notification)}
			</div>
		));
	}

	return notificationsMarkup;
}
