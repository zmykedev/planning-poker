import type { RouteObject } from 'react-router';
import NotFound from '@/views/common/not-found';
import Layout from '@/views/common/layout';
import { routesAll } from '@/routes/routes-all';
import { Suspense } from 'react';
import Main from '@/pages/Main';
import { Register } from '@/pages/Register';

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
];
