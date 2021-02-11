import {
	SET_POSTS,
	SET_SUBS,
	SET_SUB,
	SET_POST,
	ADD_POST,
	SET_COMMENTS,
	ADD_COMMENT,
	SET_USER_DATA,
	VOTE,
} from "../types";
import { Sub, Post, Comment } from "../../types";

const initialState = {
	subs: [],
	sub: null,
	posts: [],
	post: null,
	comments: [],
	userData: null,
	loading: false,
};

interface State {
	subs: Sub[];
	sub?: Sub;
	posts: Post[];
	post?: Post;
	comments: Comment[];
	userData: object;
	loading: boolean;
}

interface Action {
	type: string;
	payload: any;
}

let modifiedComments, modifiedPosts;

export default function Reducer(
	state: State = initialState,
	{ type, payload }: Action
) {
	switch (type) {
		case SET_POSTS:
			return {
				...state,
				posts: payload ? [].concat(...payload) : [],
				post: null,
			};
		case SET_SUBS:
			return {
				...state,
				subs: payload,
			};
		case SET_SUB:
			return {
				...state,
				sub: payload,
			};
		case SET_POST:
		case ADD_POST:
			return {
				...state,
				post: payload,
				posts: [],
			};
		case SET_COMMENTS:
			return {
				...state,
				comments: payload,
			};
		case ADD_COMMENT:
			return {
				...state,
				comments: [...state.comments, payload],
			};
		case SET_USER_DATA:
			return {
				...state,
				userData: payload,
			};
		case VOTE:
			console.log(payload);
			if (payload.commentIdentifier) {
				modifiedComments = state.comments.map((comment) => {
					if (comment.identifier === payload.commentIdentifier) {
						comment.voteScore = payload.voteScore;
						comment.userVote = payload.userVote;
					}
					return comment;
				});
				return Object.assign({}, state, {
					comments: modifiedComments,
				});
			} else {
				if (state.post) {
					return {
						...state,
						post: Object.assign({}, state.post, {
							voteScore: payload.voteScore,
							userVote: payload.userVote,
						}),
					};
				} else {
					modifiedPosts = state.posts.map((post) => {
						if (post.identifier === payload.identifier) {
							post.voteScore = payload.voteScore;
							post.userVote = payload.userVote;
							console.log(post);
						}
						return post;
					});
					console.log(modifiedPosts);
					console.log(
						Object.assign({}, state, {
							posts: modifiedPosts,
						})
					);
					return Object.assign({}, state, {
						posts: modifiedPosts,
					});
				}
			}
		default:
			return state;
	}
}
