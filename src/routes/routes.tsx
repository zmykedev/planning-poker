import { useRoutes } from 'react-router';
import { routesApp } from '@/routes/routes-app';

export function Routes() {
  return useRoutes(routesApp);
}
