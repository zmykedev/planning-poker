import { Navigate, Outlet } from 'react-router';
import usePlanningPokerStore from '@/store';

const Layout = () => {
  const { currentUser } = usePlanningPokerStore();

  if (!currentUser) {
    return <Navigate to='/register' replace />;
  }

  return (
    <div className='min-h-screen flex flex-col bg-[var(--color-fountain-blue-50)] dark:bg-[var(--color-fountain-blue-900)]'>
      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
