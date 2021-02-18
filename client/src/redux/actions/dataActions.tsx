import {
	ADD_SUB,
	UPDATE_SUB,
	SET_SUB,
	UPDATE_SUB_IMAGE,
	ADD_COMMENT,
	ADD_POST,
	UPDATE_USER_IMAGE,
	UPDATE_POST,
	SET_POST,
	VOTE,
	FOLLOW,
	BOOKMARK,
} from "../types";
import { Dispatch } from "redux";
import { Post, Sub, Comment, User } from "../../types";
import axios from "axios";

export const addSub = (subData: Sub) => async (dispatch: Dispatch) => {
	return axios
		.post<Sub>("/subs", subData)
		.then((response) => {
			dispatch({ type: ADD_SUB, payload: response.data });
			return response.data;
		})
		.catch((error) => {
			console.error(error);
		});
};

export const updateSub = (subData: Sub) => async (dispatch: Dispatch) => {
	return axios
		.post<Sub>(`/subs/${subData.name}/update`, subData)
		.then((response) => {
			dispatch({ type: UPDATE_SUB, payload: response.data });
			return response.data;
		})
		.catch((error) => {
			console.error(error);
		});
};

export const uploadSubImage = (formData: any) => async (dispatch: Dispatch) => {
	axios
		.post<Sub>(`/subs/${formData.get("subName")}/image`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		})
		.then((response) => {
			dispatch({
				type: UPDATE_SUB_IMAGE,
				payload: { type: formData.get("type"), data: response.data },
			});
			return response.data;
		})
		.catch((error) => {
			console.error(error);
		});
};

export const uploadUserImage = (formData: any) => async (
	dispatch: Dispatch
) => {
	await axios
		.post<User>(`/users/${formData.get("username")}/image`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		})
		.then((response) => {
			dispatch({
				type: UPDATE_USER_IMAGE,
				payload: response.data,
			});
			return response.data;
		})
		.catch((error) => {
			console.error(error);
		});
};

export const addPost = (postData: Post) => async (dispatch: Dispatch) => {
	return axios
		.post<Post>("/posts", postData)
		.then((response) => {
			dispatch({ type: ADD_POST, payload: response.data });
			return response.data;
		})
		.catch((error) => {
			console.error(error);
		});
};

export const updatePost = (postData: Post) => async (dispatch: Dispatch) => {
	const { identifier, slug } = postData;
	return axios
		.post<Post>(`/posts/${identifier}/${slug}/update`, postData)
		.then((response) => {
			dispatch({ type: UPDATE_POST, payload: response.data });
			return response.data;
		})
		.catch((error) => {
			console.error(error);
		});
};

export const addComment = ({ identifier, slug, comment }) => async (
	dispatch: Dispatch
) => {
	axios
		.post(`/posts/${identifier}/${slug}/comments`, comment)
		.then((response) => {
			dispatch({ type: ADD_COMMENT, payload: response.data });
		})
		.catch((error) => {
			console.error(error);
		});
};

export const vote = ({
	identifier,
	slug,
	commentIdentifier = null,
	value,
}) => async (dispatch: Dispatch) => {
	axios
		.post("/misc/vote", {
			identifier,
			slug,
			commentIdentifier,
			value,
		})
		.then((response) => {
			dispatch({
				type: VOTE,
				payload: {
					...response.data,
					commentIdentifier,
				},
			});
		})
		.catch((error) => {
			console.error(error);
		});
};

export const follow = ({ subName = null, username = null, value }) => async (
	dispatch: Dispatch
) => {
	axios
		.post("/misc/follow", {
			subName,
			username,
			value,
		})
		.then((response) => {
			dispatch({
				type: FOLLOW,
				payload: {
					...response.data,
					username,
				},
			});
		})
		.catch((error) => {
			console.error(error);
		});
};

export const bookmark = ({
	identifier,
	slug,
	isBookmarkPage = false,
}) => async (dispatch: Dispatch) => {
	axios
		.post("/misc/bookmark", {
			identifier,
			slug,
		})
		.then((response) => {
			dispatch({
				type: BOOKMARK,
				payload: { data: response.data, isBookmarkPage },
			});
		})
		.catch((error) => {
			console.error(error);
		});
};
