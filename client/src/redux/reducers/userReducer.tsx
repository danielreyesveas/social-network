import axios from "axios";
import {
	SET_USER,
	SET_AUTHENTICATED,
	SET_UNAUTHENTICATED,
	STOP_LOADING_UI,
	UPDATE_USER_IMAGE,
} from "../types";

const initialState = {
	authenticated: false,
	loading: false,
	credentials: {},
	notifications: [],
};

interface State {
	authenticated: boolean;
	loading: boolean;
	credentials: object;
	notifications: any[];
}

interface Action {
	type: string;
	payload: any;
}

export default function user(
	state: State = initialState,
	{ type, payload }: Action
) {
	switch (type) {
		case SET_AUTHENTICATED:
			return {
				...state,
				authenticated: true,
			};
		case SET_UNAUTHENTICATED:
			return initialState;
		case SET_USER:
			return {
				authenticated: true,
				loading: false,
				credentials: payload,
			};
		case UPDATE_USER_IMAGE:
			return Object.assign({}, state, {
				credentials: payload,
			});
		default:
			return state;
	}
}
