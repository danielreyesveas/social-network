import Head from "next/head";
import React, { useEffect } from "react";
import { gql, useSubscription } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import Threads from "../components/Threads";
import Messages from "../components/Messages";
import { connect } from "react-redux";
import { GetServerSideProps } from "next";
import axios from "axios";

const NEW_MESSAGE = gql`
	subscription newMessage {
		newMessage {
			uuid
			from
			user {
				username
				email
				imageUrl
			}
			threadId
			thread {
				id
			}
			threadd {
				id
				createdAt
				updatedAt
			}
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
			}
		}
	}
`;

export default function Chat() {
	const title = "Clics: Chat";
	const description = "Mensajería instantánea en Clics. ";
	const user = useSelector((state: any) => state.user.credentials);

	const dispatch = useDispatch();
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
			dispatch({
				type: "ADD_MESSAGE",
				payload: { user, message },
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

	return (
		<div className="container h-full">
			<Head>
				<title>{title}</title>
				<meta name="description" content={description} />
				<meta property="og:description" content={description} />
				<meta property="og:title" content={title} />
				<meta property="twitter:description" content={description} />
				<meta property="twitter:title" content={title} />
			</Head>

			<div className="flex h-full py-4">
				<div className="flex w-full antialiased text-gray-800">
					<div className="flex flex-row w-full overflow-x-hidden">
						<div className="flex flex-col flex-shrink-0 px-4 py-8 bg-white rounded-md w-80">
							<div className="flex flex-row items-center justify-center w-full h-12">
								<div className="ml-2 text-2xl font-bold">
									Chat
								</div>
							</div>
							<div className="flex flex-col items-center w-full px-4 py-6 mt-4 border border-gray-200 rounded-md bg-dark-8">
								<div className="w-20 h-20 overflow-hidden border rounded-md">
									<img
										src={user.imageUrl}
										alt="Avatar"
										className="w-full h-full"
									/>
								</div>
								<div className="mt-2 text-sm font-semibold">
									{user.username}
								</div>
								<div className="text-xs text-gray-500">
									{user.email}
								</div>
							</div>

							<Threads />
						</div>

						<Messages />
					</div>
				</div>
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	try {
		const cookie = req.headers.cookie;
		if (!cookie) throw new Error("Missing auth token cookie.");
		await axios.get("/auth/me", { headers: { cookie } });
		return { props: {} };
	} catch (error) {
		console.error(error);
		res.writeHead(307, { Location: "/login" }).end();
	}
};
