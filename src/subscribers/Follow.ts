import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
	UpdateEvent,
} from "typeorm";
import Follow from "../entities/Follow";
import { request, gql } from "graphql-request";

const CREATE_NOTIFICATION = gql`
	mutation createNotification(
		$username: String!
		$sendername: String!
		$type: String!
	) {
		createNotification(
			username: $username
			sendername: $sendername
			type: $type
		) {
			identifier
		}
	}
`;

@EventSubscriber()
export class FollowSubscriber implements EntitySubscriberInterface<Follow> {
	listenTo() {
		return Follow;
	}

	afterInsert(event: InsertEvent<any>) {
		const entity = event.entity;
		const type = "follow";
		const {
			username: sendername,
			followedUser: { username },
		} = entity;

		request("http://localhost:4000/graphql", CREATE_NOTIFICATION, {
			username,
			sendername,
			type,
		})
			.then((data) => console.log(data))
			.catch((error) => console.log(error));
	}
}
