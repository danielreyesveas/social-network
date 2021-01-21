import "../styles/tailwind.css";
import "../styles/icons.css";
import { AppProps } from "next/app";
import axios from "axios";
import { useRouter } from "next/router";
import { SWRConfig } from "swr";

import { AuthProvider } from "../context/auth";

import Navbar from "../components/Navbar";

axios.defaults.baseURL = "http://localhost:5000/api";
axios.defaults.withCredentials = true;

const fetcher = async (url: string) => {
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error(error);
		throw error.response.data;
	}
};

function App({ Component, pageProps }: AppProps) {
	const { pathname } = useRouter();
	const authRoutes = ["/register", "/login"];
	const authRoute = authRoutes.includes(pathname);

	return (
		<SWRConfig
			value={{
				fetcher,
				dedupingInterval: 10000,
			}}
		>
			<AuthProvider>
				{!authRoute && <Navbar />}
				<div className={authRoute ? "" : "pt-12"}>
					<Component {...pageProps} />
				</div>
			</AuthProvider>
		</SWRConfig>
	);
}

export default App;
