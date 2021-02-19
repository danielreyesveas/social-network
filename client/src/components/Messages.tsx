import React, { Fragment, useState, useEffect } from "react";

import { gql, useLazyQuery, useMutation } from "@apollo/client";

import { useDispatch, useSelector } from "react-redux";

import Message from "./Message";

const GET_MESSAGES = gql`
	query getMessages($threadId: Int!) {
		getMessages(threadId: $threadId) {
			uuid
			from
			user {
				username
				imageUrl
			}
			createdAt
			content
			reactions {
				uuid
				content
			}
		}
	}
`;

const SEND_MESSAGE = gql`
	mutation sendMessage($threadId: Int!, $content: String!) {
		sendMessage(threadId: $threadId, content: $content) {
			uuid
			from
			content
			createdAt
		}
	}
`;

export default function Messages() {
	const [content, setContent] = useState("");
	const selectedThread = useSelector(
		(state: any) => state.chat.selectedThread
	);
	const messages = useSelector((state: any) => state.chat.messages);

	const dispatch = useDispatch();

	const [
		getMessages,
		{ loading: messagesLoading, data: messagesData },
	] = useLazyQuery(GET_MESSAGES);

	const [sendMessage] = useMutation(SEND_MESSAGE, {
		onError: (error) => console.error(error),
	});

	useEffect(() => {
		if (selectedThread) {
			getMessages({ variables: { threadId: Number(selectedThread.id) } });
		}
		// eslint-disable-next-line
	}, [selectedThread]);

	useEffect(() => {
		if (messagesData) {
			dispatch({
				type: "SET_MESSAGES",
				payload: messagesData.getMessages,
			});
		}
		// eslint-disable-next-line
	}, [messagesData]);

	const handleSubmit = (event) => {
		if (content.trim() === "" || !selectedThread) return;

		setContent("");

		sendMessage({
			variables: { threadId: Number(selectedThread.id), content },
		});
	};

	let selectedChatMarkup;
	if (!messages && !messagesLoading) {
		selectedChatMarkup = <p className="info-text">Select a friend.</p>;
	} else if (messagesLoading) {
		selectedChatMarkup = <p className="info-text">Loading...</p>;
	} else if (!!messages.length) {
		selectedChatMarkup = messages.map((message, index) => (
			<Fragment key={message.uuid}>
				<Message message={message} />
				{index === message.length - 1 && (
					<div className="invisible">
						<hr className="m-0" />
					</div>
				)}
			</Fragment>
		));
	} else {
		selectedChatMarkup = (
			<p className="info-text">You are now connected!</p>
		);
	}

	return (
		<div className="flex flex-col flex-auto h-full p-6">
			<div className="flex flex-col flex-auto flex-shrink-0 h-full p-4 bg-gray-100 rounded-2xl">
				<div className="flex flex-col-reverse h-full mb-4 scroll">
					{selectedChatMarkup}
				</div>
				<div className="flex flex-row items-center w-full h-16 px-4 bg-white rounded-xl">
					<div className="flex-grow ml-4">
						<div className="relative w-full">
							<input
								type="text"
								className="flex w-full h-10 pl-4 border rounded-xl focus:outline-none focus:border-indigo-300"
								placeholder="Escribe aquí..."
								name="content"
								value={content}
								onChange={(event) =>
									setContent(event.target.value)
								}
							/>
						</div>
					</div>
					<div className="ml-4">
						<i
							className="mx-2 fas fa-paper-plane fa-2x text-primary"
							onClick={handleSubmit}
							role="button"
						></i>
					</div>
				</div>
			</div>
		</div>
	);
}
