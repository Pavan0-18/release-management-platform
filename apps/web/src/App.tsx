import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { apolloClient } from './apollo/client';
import { queryClient } from './api/queryClient';
import { router } from './router';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/toast';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
