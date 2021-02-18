import { User } from "../../types";
import {
	SET_THREADS,
	SET_SELECTED_USER,
	SET_USER_MESSAGES,
	ADD_MESSAGE,
	ADD_REACTION,
} from "../types";

const initialState = {
	threads: [],
	selectedThread: null,
};

interface State {
	threads: User[];
	selectedThread: any;
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
		case SET_THREADS:
			return {
				...state,
				threads: payload,
			};
		case SET_SELECTED_USER:
			usersCopy = state.threads.map((user) => ({
				...user,
				selectedThread: user.username === payload,
			}));
			return {
				...state,
				threads: usersCopy,
			};
		case SET_USER_MESSAGES:
			usersCopy = [...state.threads];
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
				threads: usersCopy,
			};
		case ADD_MESSAGE:
			usersCopy = [...state.threads];

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
				threads: usersCopy,
			};
		case ADD_REACTION:
			usersCopy = [...state.threads];

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
				threads: usersCopy,
			};

		default:
			return state;
	}
}
