import {
	SET_POSTS,
	SET_SUBS,
	ADD_SUB,
	SET_SUB,
	UPDATE_USER_IMAGE,
	UPDATE_SUB,
	UPDATE_SUB_IMAGE,
	SET_POST,
	ADD_POST,
	UPDATE_POST,
	SET_COMMENTS,
	ADD_COMMENT,
	SET_USER_DATA,
	VOTE,
	FOLLOW,
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

let index, modifiedComments, newState;

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
		case UPDATE_SUB_IMAGE:
			if (payload.type === "image") {
				return {
					...state,
					sub: Object.assign({}, state.sub, {
						imageUrl: payload.data.imageUrl,
						imageUrn: payload.data.imageUrn,
					}),
				};
			} else {
				return {
					...state,
					sub: Object.assign({}, state.sub, {
						bannerUrl: payload.data.bannerUrl,
						bannerUrn: payload.data.bannerUrn,
					}),
				};
			}
		case UPDATE_USER_IMAGE:
			return Object.assign({}, state, {
				userData: Object.assign({}, state.userData, {
					user: payload,
				}),
			});
		case UPDATE_POST:
			return {
				...state,
				post: Object.assign({}, state.post, {
					title: payload.title,
					body: payload.body,
				}),
			};
		case SET_POST:
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
					console.log(payload);
					console.log(state);
					newState = Object.assign(
						{},
						JSON.parse(JSON.stringify(state))
					);
					index = state.posts.findIndex(
						(post) => post.identifier === payload.identifier
					);
					console.log(index);
					newState.posts[index].voteScore = payload.voteScore;
					newState.posts[index].userVote = payload.userVote;
					return newState;
				}
			}
		case FOLLOW:
			if (payload.username) {
				newState = Object.assign({}, JSON.parse(JSON.stringify(state)));
				newState.userData.user.userFollow = payload.userFollow;
				newState.userData.user.followerCount = payload.followerCount;

				return newState;
			} else {
				return {
					...state,
					sub: Object.assign({}, state.sub, {
						userFollow: payload.userFollow,
						followerCount: payload.followerCount,
					}),
				};
			}
		default:
			return state;
	}
}
