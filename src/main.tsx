import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { setupAuthInterceptor } from './utils/authInterceptor';
import { BrowserRouter } from 'react-router';
import { Routes } from '@/routes/routes';

// Setup global auth interceptor for status 498
setupAuthInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  </StrictMode>,
);
