import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
} from "typeorm";
import { createNotification } from "../utils/notificationsDispatcher";
import Comment from "../entities/Comment";

@EventSubscriber()
export class CommentSubscriber implements EntitySubscriberInterface<Comment> {
	listenTo() {
		return Comment;
	}

	afterInsert(event: InsertEvent<any>) {
		const entity = event.entity;
		const type = "comment";

		const {
			username: sendername,
			id: commentId,
			post: { username, id: postId, subName },
		} = entity;

		if (username === sendername) return;

		createNotification({
			username,
			sendername,
			type,
			subName,
			postId,
			commentId,
		})
			.then((data) => console.log(data))
			.catch((error) => console.log(error));
	}
}
