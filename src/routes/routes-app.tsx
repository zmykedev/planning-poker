import type { RouteObject } from 'react-router';
import NotFound from '@/views/common/not-found';
import Layout from '@/views/common/layout';
import { Suspense } from 'react';
import Main from '@/pages/Main';
import { Register } from '@/pages/Register';

export const routesApp: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense>
        <Register />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense>
        <Register />
      </Suspense>
    ),
  },
  {
    path: '/main',
    element: (
      <Suspense>
        <Main />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
