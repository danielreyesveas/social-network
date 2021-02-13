import axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import {
	SET_USER,
	SET_AUTHENTICATED,
	SET_UNAUTHENTICATED,
	STOP_LOADING_UI,
} from "../redux/types";
import { useDispatch } from "react-redux";
import { User } from "../types";

interface State {
	authenticated: boolean;
	user: User | undefined;
	loading: boolean;
}

interface Action {
	type: string;
	payload: any;
}

const StateContext = createContext<State>({
	authenticated: false,
	user: null,
	loading: true,
});

const DispatchContext = createContext(null);

const reducer = (state: State, { type, payload }: Action) => {
	console.log(type);
	console.log(payload);
	switch (type) {
		case "LOGIN":
			return {
				...state,
				authenticated: true,
				user: payload,
			};
		case "LOGOUT":
			return {
				...state,
				authenticated: false,
				user: null,
			};
		case "STOP_LOADING":
			return {
				...state,
				loading: false,
			};
		default:
			throw new Error(`Unknown action type: ${type}.`);
	}
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const reduxDispatch = useDispatch();
	const [state, defaultDispatch] = useReducer(reducer, {
		user: null,
		authenticated: false,
		loading: true,
	});

	const dispatch = (type: string, payload?: any) =>
		defaultDispatch({ type, payload });

	useEffect(() => {
		async function loadUser() {
			try {
				console.log("loadUser");
				const response = await axios.get("/auth/me");
				console.log(state.user);
				if (!state.user) {
					dispatch("LOGIN", response.data);
					reduxDispatch({
						type: SET_USER,
						payload: response.data,
					});
				} else {
					console.log("Already logged");
				}
			} catch (error) {
				console.log(error);
			} finally {
				dispatch("STOP_LOADING");
			}
		}

		loadUser();
	}, []);

	return (
		<DispatchContext.Provider value={dispatch}>
			<StateContext.Provider value={state}>
				{children}
			</StateContext.Provider>
		</DispatchContext.Provider>
	);
};

export const useAuthState = () => useContext(StateContext);
export const useAuthDispatch = () => useContext(DispatchContext);
