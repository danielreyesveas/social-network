import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import classNames from "classnames";

import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../redux/actions/chatActions";

const GET_USERS = gql`
	query getUsers {
		getUsers {
			username
			email
			createdAt
			imageUrl
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

	const users = useSelector((state) => state.chat.users);

	const selectedUser = users?.find((u) => !!u.selected)?.username;

	const dispatch = useDispatch();

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
						src={user.imageUrl}
						className="relative z-30 inline object-cover w-10 h-10 border-2 border-white rounded-full cursor-pointer user-image profile-image"
					/>
					<div className="ml-2 text-sm font-semibold">
						<p>⊚{user.username}</p>
						<p className="font-light">
							{user.latestMessage
								? user.latestMessage.content
								: "You are now connected!"}
						</p>
					</div>
				</div>
			);
		});
	}

	return (
		<div className="flex flex-col mt-8">
			<div className="flex flex-row items-center justify-between text-xs">
				<span className="font-bold">Conversaciones</span>
				<span className="flex items-center justify-center w-4 h-4 bg-gray-300 rounded-full">
					{users?.length}
				</span>
			</div>

			<div className="flex flex-col mt-4 -mx-2 space-y-1 overflow-y-auto">
				{usersMarkup}
			</div>
		</div>
	);
}

const mapStateToProps = (store) => ({
	people: store.people,
	total: store.people.length,
});
