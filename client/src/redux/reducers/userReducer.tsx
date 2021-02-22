import axios from "axios";
import {
	SET_USER,
	SET_AUTHENTICATED,
	SET_UNAUTHENTICATED,
	STOP_LOADING_UI,
	UPDATE_USER_IMAGE,
	SET_USER_PROFILE_DATA,
	SET_NEW_NOTIFICATION,
	RESPONSE_INVITATION,
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
	let newState;
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
				...state,
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
		case RESPONSE_INVITATION:
			return Object.assign({}, state, {
				profile: Object.assign({}, state.profile, {
					user: Object.assign({}, state.profile.user, {
						invitations: state.profile.user.invitations.filter(
							(i) => i.identifier !== payload.identifier
						),
					}),
				}),
			});
		case SET_NEW_NOTIFICATION:
			newState = Object.assign({}, JSON.parse(JSON.stringify(state)));

			if (newState.credentials.lastNotifications.length >= 6) {
				newState.credentials.lastNotifications.pop();
			}
			newState.credentials.lastNotifications = [
				payload,
				...newState.credentials.lastNotifications,
			];
			newState.credentials.notificationCount++;

			if (newState.profile) {
				newState.profile.user.allNotifications = [
					payload,
					...newState.profile.user.allNotifications,
				];
				newState.profile.user.notificationCount++;
			}
			return newState;
		case UPDATE_USER_IMAGE:
			return Object.assign({}, state, {
				credentials: payload,
			});
		default:
			return state;
	}
}
