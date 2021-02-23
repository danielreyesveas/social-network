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

const uri = process.env.NEXT_URI || "/graphql/";
const wssUri = process.env.NEXT_WS_URI || "wss://www.chat.reciclatusanimales.com/graphql/";

let httpLink = createHttpLink({
	uri,
});

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem("token");
	
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
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
					Authorization: `Bearer ${localStorage.getItem("token")}`,
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
