import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { pluralize, string_trunc, tempo } from "../utils";

export default function Profile() {
	const router = useRouter();
	const profile = useSelector((state: any) => state.user.profile);

	let profileMarkup = (
		<div className="p-3 text-center">
			<div className="flex mb-3 text-sm font-medium">
				<div className="w-1/2">
					<p>{profile.user.postCount}</p>
					<p>{pluralize(profile.user.postCount, "entrada", false)}</p>
				</div>
				<div className="w-1/2">
					<p>{profile.user.followerCount}</p>
					<p>
						{pluralize(profile.user.followerCount, "grupi", false)}
					</p>
				</div>
			</div>

			{profile.user.subs.length > 0 && (
				<div className="my-5">
					<h2 className="text-center">Grupos</h2>

					{profile.user.subs.map((sub) => (
						<div
							key={sub.name}
							className="flex items-center cursor-pointer hover:bg-gray-200 hover:border-primary-4 group"
							onClick={() => router.push(sub.url)}
						>
							<img
								src={sub.imageUrl}
								className="relative z-30 inline object-cover w-12 h-12 border-2 border-white rounded-full"
								alt="User"
							/>
							<div className="ml-2 text-sm">
								<p className="text-xs font-medium">{sub.url}</p>
							</div>
						</div>
					))}
				</div>
			)}

			{profile.user.membersPreview.length > 0 && (
				<div className="my-5">
					<h2 className="text-center">Miembro</h2>

					{profile.user.membersPreview.map((member) => (
						<div
							key={member.subName}
							className="flex items-center cursor-pointer hover:bg-gray-200 hover:border-primary-4 group"
							onClick={() => router.push(member.sub.url)}
						>
							<img
								src={member.sub.imageUrl}
								className="relative z-30 inline object-cover w-12 h-12 border-2 border-white rounded-full"
								alt="User"
							/>
							<div className="ml-2 text-sm">
								<p className="text-xs font-medium">
									{member.sub.url}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			{profile.user.followersPreview.length > 0 && (
				<div className="my-5">
					<h2 className="text-center">Grupis</h2>

					<div className="-space-x-4">
						{profile.user.followersPreview.map((follower) => (
							<img
								key={follower.username}
								className="relative inline object-cover w-10 h-10 border-2 border-white rounded-full cursor-pointer profile-image"
								onClick={() => router.push(follower.user.url)}
								src={follower.user.imageUrl}
								alt="Profile image"
							/>
						))}
					</div>
				</div>
			)}
			<p className="my-3">
				<i className="mr-2 fas fa-birthday-cake"></i>
				Te uniste el{" "}
				{dayjs(profile.user.createdAt).format("D MMM YYYY")}
			</p>
		</div>
	);

	return profileMarkup;
}
