import { Message } from "postcss";
import {
	SET_THREADS,
	SORT_THREADS,
	SET_SELECTED_THREAD,
	SET_MESSAGES,
	ADD_MESSAGE,
	ADD_REACTION,
	SET_NEW_THREAD,
} from "../types";

const initialState = {
	threads: [],
	selectedThread: null,
	newThread: null,
	messages: [],
};

interface State {
	threads: any[];
	selectedThread: any;
	newThread: any;
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
	let usersCopy, userIndex, newState, threadCopy;
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
				newThread: null,
			};
		case SET_NEW_THREAD:
			return {
				...state,
				newThread: payload,
				selectedThread: null,
				messages: [],
			};
		case SET_MESSAGES:
			newState = Object.assign({}, JSON.parse(JSON.stringify(state)));
			userIndex = state.threads.findIndex(
				(thread) => thread.id === payload.threadId
			);
			newState.threads[userIndex].messages = payload.messages;
			newState.threads[userIndex].unread = 0;
			newState.messages = payload.messages;
			return newState;
		case ADD_MESSAGE:
			newState = Object.assign({}, JSON.parse(JSON.stringify(state)));
			userIndex = state.threads.findIndex(
				(thread) => thread.id === payload.message.threadId
			);
			if (userIndex > -1) {
				newState.threads[userIndex].lastMessage =
					payload.message.content;
				if (
					state.selectedThread &&
					state.selectedThread.id === payload.message.threadId
				) {
					newState.selectedThread.lastMessage =
						payload.message.content;
					newState.messages = [payload.message, ...newState.messages];
				} else {
					newState.threads[userIndex].unread++;
				}

				// Resorting threads
				threadCopy = newState.threads[userIndex];
				newState.threads.splice(userIndex, 1);
				newState.threads = [threadCopy, ...newState.threads];
			} else {
				let thread = {
					...payload.message.threadd,
					lastMessage: payload.message.content,
				};
				if (payload.user.username === payload.message.from) {
					// If the new message is mine
					thread.user = {
						username: state.newThread.username,
						imageUrl: state.newThread.imageUrl,
						email: state.newThread.email,
					};
					newState.selectedThread = thread;
					newState.messages = [payload.message, ...newState.messages];
					newState.newThread = null;
				} else {
					thread.user = payload.message.user;
					thread.unread = 1;
				}
				newState.threads = [thread, ...newState.threads];
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
