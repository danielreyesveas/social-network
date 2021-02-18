import { Dispatch } from "redux";
import axios from "axios";
import { User } from "../../types";

export const getUsers = () => async (dispatch: Dispatch) => {
	return axios
		.get<User[]>("/chat/get-users")
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
};
