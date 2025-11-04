import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import { ToastProvider } from './contexts/ToastContext';

// Lazy loading para code splitting
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage })),
);
const RoomPage = lazy(() =>
  import('./pages/RoomPage').then((module) => ({ default: module.RoomPage })),
);

// Loading component
const PageLoader = () => (
  <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>
    <div className='text-center'>
      <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent' />
      <p className='mt-4 text-gray-600 font-medium'>Cargando...</p>
    </div>
  </div>
);

export function App() {
  /* Call useWebSocket ONE TIME here to persist between routes - very important */
  const websocketState = useWebSocket();

  return (
    <ToastProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/' element={<HomePage {...websocketState} />} />
            <Route path='/room/:roomId' element={<RoomPage {...websocketState} />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}
