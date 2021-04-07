import { useEffect, useRef, useState } from "react";

const DEFAULT_MAX_FILE_SIZE_IN_BYTES: Number = 5000000;

export default function FileUpload({
	label = null,
	initialFile = null,
	updateFileCb,
	maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
	...otherProps
}) {
	const [file, setFile] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const inputRef = useRef(null);

	const setInitialFile = () => {
		console.log(initialFile);
		if (!initialFile) return setIsLoaded(true);
		const initialFileObj = {
			name: initialFile,
			type: "server/file",
			url: initialFile,
		};
		setFile(initialFileObj);
		setIsLoaded(true);
	};

	useEffect(() => {
		if (file) return;
		setInitialFile();
	}, [initialFile]);

	const handleNewFileUpload = (e) => {
		const { files: newFiles } = e.target;
		const newFile = newFiles[0];
		if (newFile.size <= maxFileSizeInBytes) {
			setFile(newFile);
			updateFileCb(newFile);
		}
	};

	const removeFile = () => {
		setFile(null);
		updateFileCb(null);
	};

	if (!isLoaded) return null;

	return file ? (
		<div className="p-6">
			<div className="relative inline-block transition duration-300 transform opacity-1 hover:opacity-50">
				<img
					src={
						file.type === "server/file"
							? file.name
							: URL.createObjectURL(file)
					}
					className="object-contain"
				/>
				<div className="absolute top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center p-2 font-bold transition duration-300 transform bg-gray-500 rounded-md opacity-0 hover:opacity-70">
					<i
						className="text-white transition duration-300 transform cursor-pointer fas fa-trash-alt hover:scale-125 fa-3x"
						onClick={removeFile}
					/>
				</div>
			</div>
		</div>
	) : (
		<section className="relative flex flex-col items-center px-5 mt-6 mb-4 transition duration-500 transform bg-white border-4 border-gray-300 border-dotted rounded-md py-14 hover:scale-102 hover:border-gray-400">
			{label && (
				<label className="absolute left-0 text-xs text-gray-500 -top-5">
					{label}
				</label>
			)}
			<p className="mt-0 font-bold tracking-widest text-center text-gray-500">
				Arrastra una imagen aquí para cargarla
			</p>
			<i className="mt-3 text-gray-500 fad fa-image-polaroid fa-5x" />
			<input
				className="absolute top-0 bottom-0 left-0 right-0 block w-full text-lg normal-case border-none opacity-0 cursor-pointer focus:outline-none"
				type="file"
				ref={inputRef}
				onChange={handleNewFileUpload}
				title=""
				value=""
				{...otherProps}
			/>
		</section>
	);
}
