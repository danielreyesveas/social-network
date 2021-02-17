import axios from "axios";
import {
	SET_USER,
	SET_AUTHENTICATED,
	SET_UNAUTHENTICATED,
	STOP_LOADING_UI,
	UPDATE_USER_IMAGE,
	SET_USER_PROFILE_DATA,
	SET_NEW_NOTIFICATION,
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
	credentials: any;
	profile: any;
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
			return {
				...state,
				credentials: Object.assign({}, state.credentials, {
					imageUrl: payload.imageUrl,
				}),
				profile: Object.assign({}, state.profile, {
					user: Object.assign({}, state.profile.user, {
						imageUrl: payload.imageUrl,
					}),
				}),
			};
		case SET_USER_PROFILE_DATA:
			return {
				...state,
				profile: payload,
			};
		case SET_NEW_NOTIFICATION:
			return {
				...state,
				credentials: Object.assign({}, state.credentials, {
					lastNotifications: [
						payload,
						...state.credentials.lastNotifications.slice(0, -1),
					],
					notificationCount: state.credentials.notificationCount + 1,
				}),
				profile: Object.assign({}, state.profile, {
					user: Object.assign({}, state.profile.user, {
						allNotifications: [
							payload,
							...state.profile.user.allNotifications,
						],
					}),
				}),
			};
		case UPDATE_USER_IMAGE:
			return Object.assign({}, state, {
				credentials: payload,
			});
		default:
			return state;
	}
}
