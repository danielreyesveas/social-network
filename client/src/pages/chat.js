import React, { useEffect } from "react";
import { gql, useSubscription } from "@apollo/client";

import { useAuthState, useAuthDispatch } from "../context/auth";
import { useMessageDispatch } from "../context/message";

import Users from "../components/Users";
import Messages from "../components/Messages";
import { connect } from "react-redux";

const NEW_MESSAGE = gql`
	subscription newMessage {
		newMessage {
			uuid
			from
			to
			content
			createdAt
		}
	}
`;

const NEW_REACTION = gql`
	subscription newReaction {
		newReaction {
			uuid
			content
			message {
				uuid
				from
				to
			}
		}
	}
`;

const Chat = ({ history, user }) => {
	const authDispatch = useAuthDispatch();
	const messageDispatch = useMessageDispatch();

	const { data: messageData, error: messageError } = useSubscription(
		NEW_MESSAGE
	);

	// const { data: reactionData, error: reactionError } = useSubscription(
	// 	NEW_REACTION
	// );

	useEffect(() => {
		if (messageError) console.error(messageError);

		if (messageData) {
			const message = messageData.newMessage;
			const otherUser =
				user.credentials.username === message.to
					? message.from
					: message.to;
			console.log(user);
			console.log(message.to);
			console.log(message.from);
			console.log(otherUser);
			messageDispatch({
				type: "ADD_MESSAGE",
				payload: {
					username: otherUser,
					message,
				},
			});
		}
		// eslint-disable-next-line
	}, [messageData, messageError]);

	// useEffect(() => {
	// 	if (reactionError) console.error(reactionError);

	// 	if (reactionData) {
	// 		const reaction = reactionData.newReaction;
	// 		const otherUser =
	// 			user.username === reaction.message.to
	// 				? reaction.message.from
	// 				: reaction.message.to;

	// 		messageDispatch({
	// 			type: "ADD_REACTION",
	// 			payload: {
	// 				username: otherUser,
	// 				reaction,
	// 			},
	// 		});
	// 	}
	// 	// eslint-disable-next-line
	// }, [reactionData, reactionError]);

	const logout = () => {
		authDispatch({ type: "LOGOUT" });
		window.location.href = "/login";
	};

	return (
		<div className="flex h-screen antialiased text-gray-800">
			<div className="flex flex-row w-full h-full overflow-x-hidden">
				<div className="flex flex-col flex-shrink-0 w-64 py-8 pl-6 pr-2 bg-white">
					<div className="flex flex-row items-center justify-center w-full h-12">
						<div className="ml-2 text-2xl font-bold">Chat</div>
					</div>
					<div className="flex flex-col items-center w-full px-4 py-6 mt-4 bg-indigo-100 border border-gray-200 rounded-lg">
						<div className="w-20 h-20 overflow-hidden border rounded-full">
							<img
								src={user.credentials.imageUrl}
								alt="Avatar"
								className="w-full h-full"
							/>
						</div>
						<div className="mt-2 text-sm font-semibold">
							{user.credentials.username}
						</div>
						<div className="text-xs text-gray-500">
							{user.credentials.email}
						</div>
						<div className="flex flex-row items-center mt-3">
							<div className="flex flex-col justify-center w-8 h-4 bg-indigo-500 rounded-full">
								<div className="self-end w-3 h-3 mr-1 bg-white rounded-full"></div>
							</div>
							<div className="ml-1 text-xs leading-none">
								Active
							</div>
						</div>
					</div>

					<Users />
				</div>

				<Messages />
			</div>
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.user,
});

const mapActionsToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapActionsToProps)(Chat);
