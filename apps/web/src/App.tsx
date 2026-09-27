import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { RouterProvider } from 'react-router-dom';
import { apolloClient } from './apollo/client';
import { router } from './router';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ErrorBoundary>
  );
};

export default App;
