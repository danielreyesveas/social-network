import dayjs from "dayjs";

import { Sub } from "../types";
import { useAuthState } from "../context/auth";
import Link from "next/link";
import { pluralize } from "../utils";

interface SidebarProps {
	sub: Sub;
	hideCreate?: boolean;
}

export default function Sidebar({ sub, hideCreate = false }: SidebarProps) {
	const { authenticated } = useAuthState();

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
					<p className="my-3">
						<i className="mr-2 fas fa-birthday-cake"></i>
						Creado el {dayjs(sub.createdAt).format("D MMM YYYY")}
					</p>
					{authenticated && !hideCreate && (
						<Link href={`/g/${sub.name}/submit`}>
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
