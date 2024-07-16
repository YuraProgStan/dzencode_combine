import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP link for regular GraphQL operations
const httpLink = createHttpLink({
    uri: process.env.REACT_APP_API_HTTP_URI
});

// Upload link for handling multipart form data
const uploadLink = createUploadLink({
    uri: process.env.REACT_APP_API_HTTP_URI,
    headers: {
        'Content-Type': 'application/json',
        'x-apollo-operation-name': 'SomeOperationName',
        'apollo-require-preflight': 'true'
    }
});

// WebSocket link for subscriptions
const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_API_WS_URI,
    options: {
        reconnect: true,
        onError: (error) => {
            console.error(`[WebSocket error]: ${error.message}`);
        }
    }
});

// Authentication link to include Bearer token
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

// Error link for handling GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        });
    }
    if (networkError) {
        console.error(`[Network error]: ${networkError}`);
    }
});

// Link composition: WebSocket for subscriptions, auth + upload for mutations, HTTP for queries
const link = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
        );
    },
    wsLink,
    authLink.concat(uploadLink),
    httpLink
);

// Apollo Client instance
const client = new ApolloClient({
    link: errorLink.concat(link), // Combining error handling with the main link
    cache: new InMemoryCache(),
    connectToDevTools: true, // Enable Apollo DevTools
});

export default client;
