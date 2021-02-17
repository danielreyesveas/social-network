import dayjs from "dayjs";

import { Sub } from "../types";
import { useAuthState } from "../context/auth";
import Link from "next/link";
import { pluralize } from "../utils";
import { useRouter } from "next/router";

interface SidebarProps {
	sub: Sub;
	hideCreate?: boolean;
}

export default function Sidebar({ sub, hideCreate = false }: SidebarProps) {
	const { authenticated } = useAuthState();
	const router = useRouter();

	return (
		<div className="hidden ml-6 mr-4 md:block w-80">
			<div className="rounded bg-primary-5">
				<div className="p-3 rounded-t bg-dark-3">
					<p className="font-semibold text-white">Nosotros</p>
				</div>
				<div className="p-3">
					<p className="mb-3 text-md linebreaks">{sub.description}</p>
					<div className="flex mb-3 text-sm font-medium">
						<div className="w-1/2">
							<p>{sub.postCount}</p>
							<p>{pluralize(sub.postCount, "entrada", false)}</p>
						</div>
						<div className="w-1/2">
							<p>{sub.followerCount}</p>
							<p>
								{pluralize(sub.followerCount, "grupi", false)}
							</p>
						</div>
					</div>

					<div className="my-5">
						<h2 className="text-center">Miembros</h2>
						<div
							key={sub.username}
							className="flex items-center mt-3 cursor-pointer hover:bg-gray-200 hover:border-primary-4 group"
							onClick={() => router.push(sub.user.url)}
						>
							<img
								src={sub.user.imageUrl}
								className="relative inline object-cover w-12 h-12 border-2 border-white rounded-full"
								alt="User"
							/>
							<div className="ml-2 text-sm">
								<p className="text-xs font-medium">
									⊚{sub.username}
								</p>
								{/* <p className="text-xs text-gray-600">
									{sub.user.email}
								</p> */}
							</div>
						</div>

						{sub.members?.map((member) => (
							<div
								key={member.username}
								className="flex items-center cursor-pointer hover:bg-gray-200 hover:border-primary-4 group"
								onClick={() => router.push(member.user.url)}
							>
								<img
									src={member.user.imageUrl}
									className="relative inline object-cover w-12 h-12 border-2 border-white rounded-full"
									alt="User"
								/>
								<div className="ml-2 text-sm">
									<p className="text-xs font-medium">
										⊚{member.username}
									</p>
								</div>
							</div>
						))}
					</div>

					{sub.followersPreview.length > 0 && (
						<div className="my-5">
							<h2 className="text-center">Grupis</h2>

							<div className="-space-x-4 text-center">
								{sub.followersPreview.map((follower) => (
									<img
										key={follower.username}
										className="relative inline object-cover w-10 h-10 border-2 border-white rounded-full cursor-pointer profile-image"
										onClick={() =>
											router.push(follower.user.url)
										}
										src={follower.user.imageUrl}
										alt="Profile image"
									/>
								))}
							</div>
						</div>
					)}

					<p className="my-5 text-center">
						<i className="fas fa-birthday-cake"></i>{" "}
						{dayjs(sub.createdAt).format("D MMM YYYY")}
					</p>

					{authenticated && !hideCreate && (
						<Link href={`${sub.url}/submit`}>
							<a className="w-full py-1 dark button">
								Nueva entrada
							</a>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
