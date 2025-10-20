import type { RouteObject } from 'react-router';
import NotFound from '@/views/common/not-found';
import Layout from '@/views/common/layout';
import { routesAll } from '@/routes/routes-all';
import { Suspense } from 'react';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';

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
    path: '/auth/login',
    element: (
      <Suspense>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/auth/register',
    element: (
      <Suspense>
        <Register />
      </Suspense>
    ),
  },
];
