import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <div className='min-h-screen flex flex-col bg-[var(--color-fountain-blue-50)] dark:bg-[var(--color-fountain-blue-900)]'>
      <main className='flex-1'>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
