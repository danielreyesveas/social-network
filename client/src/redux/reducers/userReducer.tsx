import axios from "axios";
import {
	SET_USER,
	SET_AUTHENTICATED,
	SET_UNAUTHENTICATED,
	STOP_LOADING_UI,
	UPDATE_USER_IMAGE,
	SET_USER_PROFILE_DATA,
} from "../types";

const initialState = {
	authenticated: false,
	loading: false,
	credentials: {},
	profile: null,
	notifications: [],
};

interface State {
	authenticated: boolean;
	loading: boolean;
	credentials: object;
	profile: object;
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
		case SET_USER_PROFILE_DATA:
			return {
				...state,
				profile: payload,
			};
		default:
			return state;
	}
}
