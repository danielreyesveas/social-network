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
			sub: { username: sendername, id: subId },
		} = entity;

		createNotification({ username, sendername, subId, type, value })
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
		let value;

		if (entity.status === "accepted") {
			value = "accepted";
		} else {
			value = "reinvitation";
		}

		const {
			username,
			subName,
			sub: { username: sendername },
		} = entity;

		createNotification({ username, sendername, subName, type, value })
			.then((data) => console.log(data))
			.catch((error) => console.log(error));
	}
}
