import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ReleasesPage } from '../pages/ReleasesPage';
import { ReleaseDetailPage } from '../pages/ReleaseDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <ReleasesPage />,
      },
      {
        path: 'releases',
        element: <ReleasesPage />,
      },
      {
        path: 'releases/:id',
        element: <ReleaseDetailPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
