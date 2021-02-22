import React from "react";
import Cookies from "js-cookie";

import {
	ApolloClient,
	InMemoryCache,
	createHttpLink,
	split,
	ApolloProvider as Provider,
} from "@apollo/client";

import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

import { setContext } from "@apollo/client/link/context";

// const uri = "http://localhost:4000/graphql";
// const wsUri = `ws://localhost:4000/graphql`;

const uri = "/graphql/";
let host = "localhost:4000";
if (typeof window !== "undefined") {
	host = window.location.host;
}
const wssUri = `wss://${host}/graphql/`;

let httpLink = createHttpLink({
	uri,
});

const authLink = setContext((_, { headers }) => {
	const token = Cookies.get("public_token");
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${Cookies.get("public_token")}` : "",
		},
	};
});

httpLink = authLink.concat(httpLink);

const wsLink = process.browser
	? new WebSocketLink({
			uri: wssUri,
			options: {
				reconnect: true,
				connectionParams: {
					Authorization: `Bearer ${Cookies.get("public_token")}`,
				},
			},
	  })
	: null;

const splitLink = process.browser
	? split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return (
					definition.kind === "OperationDefinition" &&
					definition.operation === "subscription"
				);
			},
			wsLink,
			httpLink
	  )
	: httpLink;

const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
});

export default function ApolloProvider(props) {
	return <Provider client={client} {...props} />;
}
