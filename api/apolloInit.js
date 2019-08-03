import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, from, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';
import apolloLogger from 'apollo-link-logger';
import nodeFetch from 'node-fetch';
import unfetch from 'unfetch';
import ws from 'ws';

import apiConfig from './config';

let apolloClient;
const isBrowser = typeof window !== 'undefined';

const errorLink = onError(({ networkError }) => {
  if (networkError.statusCode === 401) {
    isBrowser && localStorage.clear();
  }
});

const authLink = new ApolloLink((operation, forward) => {
  const { headers } = operation.getContext();
  operation.setContext({
    headers: {
      Authorization: `Bearer ${localStorage.getItem(token)}`,
      ...headers
    }
  });
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: apiConfig.graphqlEndpoint,
  fetch: isBrowser ? unfetch : nodeFetch
});

const wsClient = new SubscriptionClient(
  apiConfig.graphqlWsEndpoint,
  {
    reconnect: true,
    connectionParams: {
      authToken: isBrowser && localStorage.getItem('token')
    }
  },
  ws
);

const wsLink = new WebSocketLink(wsClient);

const dataTransportLink = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const link = from([errorLink, apolloLogger, authLink, dataTransportLink]);

function createClient(initialState) {
  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser,
    link,
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApolloClient(initialState) {
  // create a new client for every new connection to avoid
  // accross multiple connections
  console.log('initialState', initialState);
  if (!isBrowser) {
    return createClient(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = createClient(initialState);
  }
  return apolloClient;
}
