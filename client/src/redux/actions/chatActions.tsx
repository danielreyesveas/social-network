import { SET_USERS } from "../types";
import { Dispatch } from "redux";
import axios from "axios";
import { User } from "../../types";

export const getUsers = () => async (dispatch: Dispatch) => {
	return axios
		.get<User[]>("/chat/get-users")
		.then((response) => {
			console.log(response);
			dispatch({ type: SET_USERS, payload: response.data });
		})
		.catch((error) => {
			console.error(error);
		});
};
