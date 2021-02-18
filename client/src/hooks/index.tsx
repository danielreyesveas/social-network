import useSWR, { useSWRInfinite } from "swr";
import { useDispatch } from "react-redux";
import {
	SET_POSTS,
	SET_SUBS,
	SET_SUB,
	SET_POST,
	SET_COMMENTS,
	SET_USER_DATA,
	SET_USER_PROFILE_DATA,
} from "../redux/types";
import { Post, Sub, Comment } from "../types";

export const useGetPosts = () => {
	const dispatch = useDispatch();
	const {
		data,
		error,
		size: page,
		setSize: setPage,
		revalidate,
	} = useSWRInfinite<Post[]>((index) => `/posts?page=${index}`, {
		onSuccess: (data) => {
			dispatch({ type: SET_POSTS, payload: data });
		},
	});

	return { data, error, page, setPage, revalidate };
};

export const useGetBookmarkPosts = () => {
	const dispatch = useDispatch();
	const {
		data,
		error,
		size: page,
		setSize: setPage,
		revalidate,
	} = useSWRInfinite<Post[]>((ind) => `/posts/bookmarks?page=${ind}`, {
		onSuccess: (data) => {
			dispatch({ type: SET_POSTS, payload: data });
		},
	});

	return { data, error, page, setPage, revalidate };
};

export const useGetSubPosts = (subName: any) => {
	const dispatch = useDispatch();
	const path = subName ? `subs/${subName}/posts?page=` : null;

	const {
		data,
		error,
		size: page,
		setSize: setPage,
		revalidate,
	} = useSWRInfinite<Post[]>((index) => (path ? `${path}${index}` : null), {
		onSuccess: (data) => {
			dispatch({ type: SET_POSTS, payload: data });
		},
	});

	return { data, error, page, setPage, revalidate };
};

export const useGetSubs = () => {
	const dispatch = useDispatch();
	const path = "/misc/top-subs";

	const { data: subs, error } = useSWR<Sub[]>(path, {
		onSuccess: (data) => {
			dispatch({ type: SET_SUBS, payload: data });
		},
	});

	return { subs, error };
};

export const useGetSub = (subName: any) => {
	const dispatch = useDispatch();
	const path = subName ? `/subs/${subName}` : null;

	const { data: sub, error } = useSWR<Sub>(path, {
		onSuccess: (data) => {
			dispatch({ type: SET_SUB, payload: data });
		},
	});

	return { sub, error };
};

export const useGetPost = (identifier: any, slug: any) => {
	const dispatch = useDispatch();
	const path = identifier && slug ? `/posts/${identifier}/${slug}` : null;

	const { data: post, error } = useSWR<Post>(path, {
		onSuccess: (data) => {
			dispatch({ type: SET_POST, payload: data });
		},
	});

	return { post, error };
};

export const useGetComments = (identifier: any, slug: any) => {
	const dispatch = useDispatch();
	const path =
		identifier && slug ? `/posts/${identifier}/${slug}/comments` : null;

	const { data: comments, revalidate } = useSWR<Comment[]>(path, {
		onSuccess: (data) => {
			dispatch({ type: SET_COMMENTS, payload: data });
		},
	});

	return { comments, revalidate };
};

export const useGetUserData = (username: any) => {
	const dispatch = useDispatch();
	const path = username ? `/users/user/${username}` : null;

	const { data: userData, error } = useSWR<any>(path, {
		onSuccess: (data) => {
			dispatch({ type: SET_USER_DATA, payload: data });
		},
	});

	return { userData, error };
};

export const useGetUserProfileData = () => {
	const dispatch = useDispatch();
	const path = "/users/profile";

	const { data: userData, error } = useSWR<any>(path, {
		onSuccess: (data) => {
			dispatch({ type: SET_USER_PROFILE_DATA, payload: data });
		},
	});

	return { userData, error };
};
