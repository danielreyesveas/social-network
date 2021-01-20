import "../styles/tailwind.css";
import { AppProps } from "next/app";
import axios from "axios";
import { useRouter } from "next/router";

import Navbar from "../components/Navbar";

axios.defaults.baseURL = "http://localhost:5000/api";
axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
	const { pathname } = useRouter();
	const authRoutes = ["/register", "/login"];
	const authRoute = authRoutes.includes(pathname);

	return (
		<>
			{!authRoute && <Navbar />}
			<Component {...pageProps} />
		</>
	);
}

export default App;
