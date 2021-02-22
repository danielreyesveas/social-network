import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
	RemoveEvent,
	UpdateEvent,
} from "typeorm";
import { createNotification } from "../utils/notificationsDispatcher";
import SubMember from "../entities/SubMember";

const type = "subMember";

@EventSubscriber()
export class SubMemberSubscriber
	implements EntitySubscriberInterface<SubMember> {
	listenTo() {
		return SubMember;
	}

	afterInsert(event: InsertEvent<any>) {
		const entity = event.entity;
		const value = "invitation";

		const {
			username,
			subName,
			sub: { username: sendername },
		} = entity;

		createNotification({ username, sendername, subName, type, value })
			.then((data) => console.log(data))
			.catch((error) => console.log(error));
	}

	afterRemove(event: RemoveEvent<any>) {
		const entity = event.entity;
		const value = "deletion";

		const {
			username,
			subName,
			sub: { username: sendername },
		} = entity;

		createNotification({ username, sendername, subName, type, value })
			.then((data) => console.log(data))
			.catch((error) => console.log(error));
	}

	afterUpdate(event: UpdateEvent<any>) {
		const entity = event.entity;
		const { subName } = entity;
		let value: string, username: string, sendername: string;

		if (entity.status === "accepted" || entity.status === "rejected") {
			value = entity.status;
			username = entity.sub.username;
			sendername = entity.username;

			createNotification({ username, sendername, subName, type, value })
				.then(() => {
					if (entity.status === "accepted") {
						createNotification({
							username: sendername,
							subName,
							type: "sub",
						})
							.then((data) => console.log(data))
							.catch((error) => console.log(error));
					}
				})
				.catch((error) => console.log(error));
		} else if (entity.status === "pending") {
			value = "reinvitation";
			username = entity.username;
			sendername = entity.sub.username;

			createNotification({ username, sendername, subName, type, value })
				.then((data) => console.log(data))
				.catch((error) => console.log(error));
		}
	}
}
