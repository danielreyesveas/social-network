import React, { Fragment, useState, useEffect } from "react";

import { gql, useLazyQuery, useMutation } from "@apollo/client";

import { useDispatch, useSelector } from "react-redux";

import Message from "./Message";

const GET_MESSAGES = gql`
	query getMessages($from: String!) {
		getMessages(from: $from) {
			uuid
			from
			to
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
	mutation sendMessage($to: String!, $content: String!) {
		sendMessage(to: $to, content: $content) {
			uuid
			from
			to
			content
			createdAt
		}
	}
`;

export default function Messages() {
	const users = useSelector((state) => state.chat.users);
	const [content, setContent] = useState("");
	const selectedUser = users?.find((u) => !!u.selected);
	const dispatch = useDispatch();
	const messages = selectedUser?.messages;

	const [
		getMessages,
		{ loading: messagesLoading, data: messagesData },
	] = useLazyQuery(GET_MESSAGES);

	const [sendMessage] = useMutation(SEND_MESSAGE, {
		onError: (error) => console.error(error),
	});

	useEffect(() => {
		console.log(selectedUser);
		if (selectedUser && !selectedUser.messages) {
			getMessages({ variables: { from: selectedUser.username } });
		}
		// eslint-disable-next-line
	}, [selectedUser]);

	useEffect(() => {
		if (messagesData) {
			dispatch({
				type: "SET_USER_MESSAGES",
				payload: {
					username: selectedUser.username,
					messages: messagesData.getMessages,
				},
			});
		}
		// eslint-disable-next-line
	}, [messagesData]);

	const handleSubmit = (event) => {
		if (content.trim() === "" || !selectedUser) return;

		setContent("");

		sendMessage({ variables: { to: selectedUser.username, content } });
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
				<div className="flex flex-col h-full mb-4 overflow-x-auto">
					<div className="flex flex-col h-full">
						<div className="grid grid-cols-12 gap-y-2">
							{selectedChatMarkup}
						</div>
					</div>
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
