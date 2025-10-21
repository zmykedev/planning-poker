import type { RouteObject } from 'react-router';
import NotFound from '@/views/common/not-found';
import Layout from '@/views/common/layout';
import { routesAll } from '@/routes/routes-all';
import { Suspense } from 'react';
import Register from '@/pages/auth/register';
import Main from '@/pages/Main';

export const routesApp: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [...routesAll],
  },
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/auth/register',
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
];
