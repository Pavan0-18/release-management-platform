import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql';

const httpLink = new HttpLink({
  uri: API_URL,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});
