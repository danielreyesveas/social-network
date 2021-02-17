import {
	SET_USER,
	SET_UNAUTHENTICATED,
	SET_ERRORS,
	CLEAR_ERRORS,
	LOADING_UI,
	STOP_LOADING_UI,
	SET_USER_PROFILE_DATA,
} from "../types";
import { Dispatch } from "redux";
import { User } from "../../types";
import axios from "axios";

export const login = (userData: User) => (dispatch: Dispatch) => {
	dispatch({ type: LOADING_UI });
	return axios
		.post("/auth/login", userData)
		.then((res) => {
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

export const logout = () => (dispatch) => {
	axios
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
