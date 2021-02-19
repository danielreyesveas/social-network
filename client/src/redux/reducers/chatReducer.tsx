import { Message } from "postcss";
import { User } from "../../types";
import {
	SET_THREADS,
	SET_SELECTED_THREAD,
	SET_MESSAGES,
	ADD_MESSAGE,
	ADD_REACTION,
} from "../types";

const initialState = {
	threads: [],
	selectedThread: null,
	messages: [],
};

interface State {
	threads: any[];
	selectedThread: any;
	messages: Message[];
}

interface Action {
	type: string;
	payload: any;
}

export default function Reducer(
	state: State = initialState,
	{ type, payload }: Action
) {
	let usersCopy, userIndex, newState;
	switch (type) {
		case SET_THREADS:
			return {
				...state,
				threads: payload,
			};
		case SET_SELECTED_THREAD:
			return {
				...state,
				selectedThread: payload,
			};
		case SET_MESSAGES:
			return {
				...state,
				messages: payload,
			};
		case ADD_MESSAGE:
			userIndex = state.threads.findIndex(
				(thread) => thread.id === payload.threadId
			);
			newState = Object.assign({}, JSON.parse(JSON.stringify(state)));
			newState.threads[userIndex].lastMessage = payload.content;

			if (state.selectedThread) {
				newState.selectedThread.lastMessage = payload.content;
				newState.messages = [...newState.messages, payload];
			}

			return newState;
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
