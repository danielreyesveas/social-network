import { useMemo } from "react";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let apolloClient;

function createApolloClient(ctx) {
	let headers = {};
	let accessToken = "";
	if (ctx) {
		console.log(ctx);
		accessToken = "";
		if (accessToken) {
			headers = {
				Authorization: accessToken,
			};
		}
	}

	const httpLink = createHttpLink({
		uri: "http://localhost:4000/graphql",
	});
	const authLink = setContext((req, { headers }) => {
		console.log(req, headers);
		// get the authentication token from local storage if it exists
		// return the headers to the context so httpLink can read them
		return {
			headers: {
				...headers,
				authorization: accessToken ? `Bearer ${accessToken}` : "",
			},
		};
	});
	return new ApolloClient({
		ssrMode: typeof window === "undefined",
		link: authLink.concat(httpLink),
		cache: new InMemoryCache(),
		credentials: "include",
		headers: headers,
		// defaultOptions: defaultOptions
	});
}

export function initializeApollo(initialState = null, ctx) {
	const _apolloClient = apolloClient ?? createApolloClient(ctx);

	// If your page has Next.js data fetching methods that use Apollo Client, the initial state
	// get hydrated here
	if (initialState) {
		_apolloClient.cache.restore(initialState);
	}
	// For SSG and SSR always create a new Apollo Client
	if (typeof window === "undefined") return _apolloClient;
	// Create the Apollo Client once in the client
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState, ctx) {
	const store = useMemo(() => initializeApollo(initialState, ctx), [
		initialState,
		ctx,
	]);
	return store;
}
