import {
	SET_USER,
	SET_UNAUTHENTICATED,
	SET_ERRORS,
	CLEAR_ERRORS,
	LOADING_UI,
	RESPONSE_INVITATION,
	SET_USER_PROFILE_DATA,
} from "../types";
import { Dispatch } from "redux";
import { User } from "../../types";
import axios from "axios";

export const login = (userData: User) => async (dispatch: Dispatch) => {
	dispatch({ type: LOADING_UI });
	return axios
		.post("/auth/login", userData)
		.then((res) => {
			localStorage.setItem("token", res.data.token);
			dispatch({ type: CLEAR_ERRORS });
			dispatch({ type: SET_USER, payload: res.data.user });
			return res.data.user;
		})
		.catch((err) => {
			dispatch({
				type: SET_ERRORS,
				payload: err.response.data,
			});
			return Promise.reject(err.response.data);
		});
};

export const loginWithGoogle = (userData) => async (dispatch: Dispatch) => {
	return axios
		.post("/auth/login-with-google", userData)
		.then((res) => {
			console.log(res);
			localStorage.setItem("token", res.data.token);
			dispatch({ type: CLEAR_ERRORS });
			dispatch({ type: SET_USER, payload: res.data.user });
			return res.data.user;
		})
		.catch((err) => {
			console.log(err);
			return Promise.reject(err.response.data);
		});
};

export const logout = () => async (dispatch: Dispatch) => {
	return axios
		.get("/auth/logout")
		.then(() => {
			dispatch({ type: CLEAR_ERRORS });
			dispatch({ type: SET_UNAUTHENTICATED });
			return;
		})
		.catch((err) => {
			dispatch({
				type: SET_ERRORS,
				payload: err.response.data,
			});
			return Promise.reject(err.response.data);
		});
};

export const responseInvitation = (invitation) => async (
	dispatch: Dispatch
) => {
	axios
		.post("/misc/response-invitation", invitation)
		.then((response) => {
			dispatch({ type: RESPONSE_INVITATION, payload: response.data });
		})
		.catch((error) =>
			dispatch({
				type: SET_ERRORS,
				payload: error.response.data,
			})
		);
};
