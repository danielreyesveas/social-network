import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
} from "typeorm";
import { createNotification } from "../utils/notificationsDispatcher";
import Follow from "../entities/Follow";

@EventSubscriber()
export class FollowSubscriber implements EntitySubscriberInterface<Follow> {
	listenTo() {
		return Follow;
	}

	afterInsert(event: InsertEvent<any>) {
		const entity = event.entity;
		if (entity.followedUser) {
			const type = "follow";
			const {
				username: sendername,
				followedUser: { username },
			} = entity;

			createNotification({ username, sendername, type })
				.then((data) => console.log(data))
				.catch((error) => console.log(error));
		}
	}
}
