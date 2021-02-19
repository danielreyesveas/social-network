import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import classNames from "classnames";

import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import axios from "axios";
import { User } from "../types";

const GET_THREADS = gql`
	query getThreads {
		getThreads {
			id
			createdAt
			lastMessage
			updatedAt

			user {
				username
				imageUrl
			}
		}
	}
`;

export default function Users() {
	let usersMarkup;
	const [search, setSearch] = useState("");
	const [newUsers, setNewUsers] = useState<User[]>([]);
	const [timer, setTimer] = useState(null);

	const threads = useSelector((state: any) => state.chat.threads);
	const selectedThread = useSelector(
		(state: any) => state.chat.selectedThread
	);

	const dispatch = useDispatch();

	useEffect(() => {
		if (search.trim() === "") {
			setNewUsers([]);
			return;
		}
		searchUsers();
	}, [search]);

	const searchUsers = async () => {
		clearTimeout(timer);
		setTimer(
			setTimeout(async () => {
				try {
					const { data } = await axios.post(
						`/users/search/${search}`,
						{ membersNames: [] }
					);
					setNewUsers(data);
				} catch (error) {
					console.error(error);
				}
			}, 250)
		);
	};

	const addUser = (username: string) => {
		setSearch("");
	};

	const { loading } = useQuery(GET_THREADS, {
		onCompleted: (data) =>
			dispatch({ type: "SET_THREADS", payload: data.getThreads }),
		onError: (error) => console.error(error),
	});

	const handleClickThread = (thread: any) => {
		dispatch({ type: "SET_SELECTED_THREAD", payload: thread });
	};

	if (!threads || loading) {
		usersMarkup = <p>Loading...</p>;
	} else if (threads.length === 0) {
		usersMarkup = <p>No users yet</p>;
	} else if (threads.length > 0) {
		usersMarkup = threads.map((thread) => {
			const selected =
				selectedThread?.user.username === thread.user.username;
			return (
				<div
					className={classNames(
						"flex flex-row user-div justify-content-center justify-content-md-start p-3 cursor-pointer",
						{
							"bg-white": selected,
						}
					)}
					//className="flex flex-row items-center p-2 hover:bg-gray-100 rounded-xl"
					key={thread.user.username}
					onClick={() => handleClickThread(thread)}
				>
					<img
						src={thread.user.imageUrl}
						className="relative z-30 inline object-cover w-10 h-10 border-2 border-white rounded-full cursor-pointer user-image profile-image"
					/>
					<div className="ml-2 text-sm font-semibold">
						<p>⊚{thread.user.username}</p>
						<p className="italic font-extralight">
							{thread.lastMessage
								? thread.lastMessage
								: "You are now connected!"}
						</p>
					</div>
				</div>
			);
		});
	}

	return (
		<div className="flex flex-col mt-8">
			<div className="items-center justify-between text-xs">
				<p className="font-medium">Conversaciones</p>

				<div className="max-w-full px-2 my-6 sm-px-4 w-60 sm:w-100">
					<div className="relative flex items-center bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
						<i className="pl-4 pr-3 text-gray-500 fas fa-search"></i>
						<input
							type="text"
							className="w-full py-1 pr-3 bg-transparent rounded focus:outline-none"
							placeholder="Buscar"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<div
							className="absolute left-0 right-0 z-10 overflow-y-scroll bg-white max-h-52"
							style={{ top: "100%" }}
						>
							{newUsers?.map((user) => (
								<div
									key={user.username}
									className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
									onClick={() => addUser(user.username)}
								>
									<Image
										src={user.imageUrl}
										className="rounded-full"
										alt="User"
										height={(8 * 16) / 4}
										width={(8 * 16) / 4}
									/>
									<div className="ml-4 text-sm">
										<p className="font-medium">
											⊚{user.username}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<span className="flex items-center justify-center w-4 h-4 bg-gray-300 rounded-full">
					{threads?.length}
				</span>
			</div>

			<div className="flex flex-col mt-4 -mx-2 space-y-1 overflow-y-auto">
				{usersMarkup}
			</div>
		</div>
	);
}
