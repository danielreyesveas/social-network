import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center">
			<h1 className="mt-10 mb-4 text-5xl text-gray-800">
				La página no existe
			</h1>
			<Link href="/">
				<a className="px-4 py2 blue button">Volver</a>
			</Link>
		</div>
	);
}
