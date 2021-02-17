import {
	EntitySubscriberInterface,
	EventSubscriber,
	UpdateEvent,
} from "typeorm";
import Post from "../entities/Post";
import { request, gql } from "graphql-request";

const NOTIFICATION = gql`
	mutation createNotification($username: String!) {
		createNotification(username: $username) {
			identifier
		}
	}
`;

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
	listenTo() {
		return Post;
	}

	afterUpdate(event: UpdateEvent<any>) {
		const entity = event.entity;

		request("http://localhost:4000/graphql", NOTIFICATION, {
			username: "tuto",
		})
			.then((data) => console.log(data))
			.catch((error) => console.log(error));
	}
}
