import React from "react";
import { gql, useQuery } from "@apollo/client";
import classNames from "classnames";

import { useMessageDispatch, useMessageState } from "../context/message";

const GET_USERS = gql`
	query getUsers {
		getUsers {
			username
			email
			createdAt
			imageUrn
			latestMessage {
				uuid
				from
				to
				content
				createdAt
			}
		}
	}
`;

export default function Users() {
	let usersMarkup;
	const dispatch = useMessageDispatch();
	const { users } = useMessageState();
	const selectedUser = users?.find((u) => !!u.selected)?.username;

	const { loading } = useQuery(GET_USERS, {
		onCompleted: (data) =>
			dispatch({ type: "SET_USERS", payload: data.getUsers }),
		onError: (error) => console.error(error),
	});

	const handleClickUser = (username) => {
		console.log(username);
		dispatch({ type: "SET_SELECTED_USER", payload: username });
	};

	if (!users || loading) {
		usersMarkup = <p>Loading...</p>;
	} else if (users.length === 0) {
		usersMarkup = <p>No users yet</p>;
	} else if (users.length > 0) {
		usersMarkup = users.map((user) => {
			const selected = selectedUser === user.username;
			return (
				<div
					className={classNames(
						"flex flex-row user-div justify-content-center justify-content-md-start p-3 cursor-pointer",
						{
							"bg-white": selected,
						}
					)}
					//className="flex flex-row items-center p-2 hover:bg-gray-100 rounded-xl"
					key={user.username}
					onClick={() => handleClickUser(user.username)}
				>
					<img
						src={
							user.imageUrn ||
							"https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
						}
						className="relative z-30 inline object-cover w-10 h-10 border-2 border-white rounded-full cursor-pointer user-image profile-image"
					/>
					<div className="ml-2 text-sm font-semibold">
						{user.username}
					</div>
				</div>
			);
		});
	}
	//return (
	// <div
	// 	role="button"
	// 	className={classNames(
	// 		"user-div d-flex justify-content-center justify-content-md-start p-3",
	// 		{
	// 			"bg-white": selected,
	// 		}
	// 	)}
	// 	key={user.username}
	// 	onClick={() => handleClickUser(user.username)}
	// >
	// 	<img
	// 		src={
	// 			user.imageUrn ||
	// 			"https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
	// 		}
	// 		className="user-image"
	// 	/>

	// 	<div className="ml-2 d-none d-md-block">
	// 		<p className="text-success">{user.username}</p>
	// 		<p className="font-weight-light">
	// 			{user.latestMessage
	// 				? user.latestMessage.content
	// 				: "You are now connected!"}
	// 		</p>
	// 	</div>
	// </div>

	//);

	return (
		<div className="flex flex-col mt-8">
			<div className="flex flex-row items-center justify-between text-xs">
				<span className="font-bold">Conversaciones</span>
				<span className="flex items-center justify-center w-4 h-4 bg-gray-300 rounded-full">
					{users?.length}
				</span>
			</div>

			<div className="flex flex-col mt-4 -mx-2 space-y-1 overflow-y-auto max-h-100">
				{usersMarkup}
			</div>
		</div>
	);
}
