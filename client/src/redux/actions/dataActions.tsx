import { ADD_COMMENT, ADD_POST, VOTE } from "../types";
import { Dispatch } from "redux";
import { Post, Sub, Comment } from "../../types";
import axios from "axios";

export const addPost = (postData: Post) => (dispatch: Dispatch) => {
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

export const addComment = ({ identifier, slug, comment }) => (
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

export const vote = ({ identifier, slug, commentIdentifier = null, value }) => (
	dispatch: Dispatch
) => {
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
