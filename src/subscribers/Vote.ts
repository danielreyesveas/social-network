import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
	UpdateEvent,
} from "typeorm";
import { createNotification } from "../utils/notificationsDispatcher";
import Vote from "../entities/Vote";

const dispatchNotification = (entity: any) => {
	if (entity.value === 1) {
		const type = "vote";
		let username, postId, commentId, subName;

		const { username: sendername } = entity;

		if (entity.post) {
			username = entity.post.username;
			subName = entity.post.subName;
			postId = entity.post.id;
		} else {
			username = entity.comment.username;
			commentId = entity.comment.id;
			subName = entity.comment.post.subName;
			postId = entity.comment.post.id;
		}

		if (username === sendername) return;

		createNotification({
			username,
			sendername,
			type,
			value: "up",
			subName,
			postId,
			commentId,
		})
			.then((data) => console.log(data))
			.catch((error) => console.log(error));
	} else {
		return;
	}
};

@EventSubscriber()
export class VoteSubscriber implements EntitySubscriberInterface<Vote> {
	listenTo() {
		return Vote;
	}

	afterInsert(event: InsertEvent<any>) {
		const entity = event.entity;
		dispatchNotification(entity);
	}

	afterUpdate(event: UpdateEvent<any>) {
		const entity = event.entity;
		dispatchNotification(entity);
	}
}
