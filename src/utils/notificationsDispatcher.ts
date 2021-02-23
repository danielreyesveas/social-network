import { gql } from "graphql-request";
import { request } from "graphql-request";

const CREATE_NOTIFICATION = gql`
	mutation createNotification(
		$username: String!
		$type: String!
		$value: String
		$sendername: String
		$subName: String
		$postId: Int
		$commentId: Int
	) {
		createNotification(
			username: $username
			type: $type
			value: $value
			sendername: $sendername
			subName: $subName
			postId: $postId
			commentId: $commentId
		) {
			identifier
		}
	}
`;

export function createNotification(values: any) {
	const url = process.env.NODE_NOTIFICATIONS_URL || "http://localhost:4000/graphql";
	
	const {
		username,
		type,
		value = null,
		sendername = null,
		subName = null,
		postId = null,
		commentId = null,
	} = values;

	return request(url, CREATE_NOTIFICATION, {
		username,
		type,
		value,
		sendername,
		subName,
		postId,
		commentId,
	});
}
