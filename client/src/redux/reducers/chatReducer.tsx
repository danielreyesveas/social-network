import { User } from "../../types";
import {
	SET_USERS,
	SET_SELECTED_USER,
	SET_USER_MESSAGES,
	ADD_MESSAGE,
	ADD_REACTION,
} from "../types";

const initialState = {
	users: null,
	selected: null,
};

interface State {
	users: User[];
}

interface Action {
	type: string;
	payload: any;
}

export default function Reducer(
	state: State = initialState,
	{ type, payload }: Action
) {
	let usersCopy, userIndex;
	switch (type) {
		case SET_USERS:
			return {
				...state,
				users: payload,
			};
		case SET_SELECTED_USER:
			usersCopy = state.users.map((user) => ({
				...user,
				selected: user.username === payload,
			}));
			return {
				...state,
				users: usersCopy,
			};
		case SET_USER_MESSAGES:
			usersCopy = [...state.users];
			let messages = payload.messages;
			userIndex = usersCopy.findIndex(
				(user) => user.username === payload.username
			);
			usersCopy[userIndex] = {
				...usersCopy[userIndex],
				messages,
			};

			return {
				...state,
				users: usersCopy,
			};
		case ADD_MESSAGE:
			usersCopy = [...state.users];

			userIndex = usersCopy.findIndex(
				(user) => user.username === payload.username
			);

			payload.message.reactions = [];

			let newUser = {
				...usersCopy[userIndex],
				messages: usersCopy[userIndex].messages
					? [...usersCopy[userIndex].messages, payload.message]
					: null,
				latestMessage: payload.message,
			};
			usersCopy[userIndex] = newUser;

			return {
				...state,
				users: usersCopy,
			};
		case ADD_REACTION:
			usersCopy = [...state.users];

			userIndex = usersCopy.findIndex(
				(user) => user.username === payload.username
			);

			// Make a shallow copy of user
			let userCopy = { ...usersCopy[userIndex] };

			// Find the index of the message that this reaction pertains to
			const messageIndex = userCopy.messages?.findIndex(
				(m) => m.uuid === payload.reaction.message.uuid
			);

			if (messageIndex > -1) {
				// Make a shallow copy of the user messages
				let messagesCopy = [...userCopy.messages];

				// Make a shallow copy of the user message reactions
				let reactionsCopy = [...messagesCopy[messageIndex].reactions];

				const reactionIndex = reactionsCopy.findIndex(
					(r) => r.uuid === payload.reaction.uuid
				);

				if (reactionIndex > -1) {
					// Reaction exists, update it
					reactionsCopy[reactionIndex] = payload.reaction;
				} else {
					// New reaction added
					reactionsCopy = [...reactionsCopy, payload.reaction];
				}

				messagesCopy[messageIndex] = {
					...messagesCopy[messageIndex],
					reactions: reactionsCopy,
				};

				userCopy = { ...userCopy, messages: messagesCopy };
				usersCopy[userIndex] = userCopy;
			}

			return {
				...state,
				users: usersCopy,
			};

		default:
			return state;
	}
}
