import "../styles/tailwind.css";
import "../styles/icons.css";
import { AppProps } from "next/app";
import axios from "axios";
import { useRouter } from "next/router";
import { SWRConfig } from "swr";
import "dayjs/locale/es";
import dayjs from "dayjs";

import ApolloProvider from "../ApolloProvider";

dayjs.locale("es");

import { AuthProvider, UIProvider } from "../context";
import { MessageProvider } from "../context/message";
import { Provider } from "react-redux";
import store from "../redux/store";
import Navbar from "../components/Navbar";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
axios.defaults.withCredentials = true;

const fetcher = async (url: string) => {
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		throw error.response.data;
	}
};

const App = ({ Component, pageProps }: AppProps) => {
	const { pathname } = useRouter();
	const authRoutes = ["/register", "/login"];
	const authRoute = authRoutes.includes(pathname);

	return (
		<ApolloProvider>
			<SWRConfig
				value={{
					fetcher,
					dedupingInterval: 10000,
				}}
			>
				<Provider store={store}>
					<AuthProvider>
						<MessageProvider>
							<UIProvider>
								{!authRoute && <Navbar />}
								<div className={authRoute ? "" : "pt-12"}>
									<Component {...pageProps} />
								</div>
							</UIProvider>
						</MessageProvider>
					</AuthProvider>
				</Provider>
			</SWRConfig>
		</ApolloProvider>
	);
};

export default App;
