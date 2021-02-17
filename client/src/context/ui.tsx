import { createContext, useContext, useEffect, useReducer } from "react";

interface State {
	showNotificationsTab: boolean;
	loading: boolean;
}

interface Action {
	type: string;
	payload?: any;
}
const StateContext = createContext<State>({
	showNotificationsTab: false,
	loading: false,
});

const DispatchContext = createContext(null);

let show: boolean;

const reducer = (state: State, { type, payload }: Action) => {
	switch (type) {
		case "TOGGLE_NOTIFICATIONS_TAB":
			if (payload === undefined) show = !state.showNotificationsTab;
			else show = payload;

			return {
				...state,
				showNotificationsTab: show,
			};
		case "STOP_LOADING":
			return {
				...state,
				loading: false,
			};
		case "START_LOADING":
			return {
				...state,
				loading: true,
			};
		default:
			throw new Error(`Unknown action type: ${type}.`);
	}
};

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, defaultDispatch] = useReducer(reducer, {
		showNotificationsTab: false,
		loading: false,
	});

	const dispatch = (type: string, payload?: any) =>
		defaultDispatch({ type, payload });

	return (
		<DispatchContext.Provider value={dispatch}>
			<StateContext.Provider value={state}>
				{children}
			</StateContext.Provider>
		</DispatchContext.Provider>
	);
};

export const useUIState = () => useContext(StateContext);
export const useUIDispatch = () => useContext(DispatchContext);
