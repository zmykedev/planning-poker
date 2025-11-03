import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastVariant = 'default' | 'success' | 'error' | 'info';

interface ToastType {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: {
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
  }) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastType, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 3000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: Omit<ToastType, 'id'>) => {
      addToast(options);
    },
    [addToast],
  );

  const success = useCallback(
    (message: string) => {
      addToast({ description: message, variant: 'success' });
    },
    [addToast],
  );

  const error = useCallback(
    (message: string) => {
      addToast({ description: message, variant: 'error' });
    },
    [addToast],
  );

  const info = useCallback(
    (message: string) => {
      addToast({ description: message, variant: 'info' });
    },
    [addToast],
  );

  const getIcon = (variant?: ToastVariant) => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className='h-5 w-5 text-green-600' />;
      case 'error':
        return <AlertCircle className='h-5 w-5 text-red-600' />;
      case 'info':
        return <Info className='h-5 w-5 text-blue-600' />;
      default:
        return null;
    }
  };

  const variantStyles = {
    default: 'bg-white border-slate-200',
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      <ToastPrimitives.Provider>
        {children}
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastPrimitives.Root
              key={toast.id}
              duration={toast.duration || 3000}
              onOpenChange={(open) => {
                if (!open) removeToast(toast.id);
              }}
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                className={cn(
                  'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-10 shadow-lg',
                  variantStyles[toast.variant || 'default'],
                )}
              >
                <div className='flex items-center gap-3 flex-1'>
                  {getIcon(toast.variant)}
                  <div className='grid gap-1 flex-1'>
                    {toast.title && <div className='text-sm font-semibold'>{toast.title}</div>}
                    {toast.description && <div className='text-sm opacity-90'>{toast.description}</div>}
                  </div>
                </div>
                <ToastPrimitives.Close
                  className='absolute right-2 top-2 rounded-md p-1 text-slate-500 opacity-70 transition-opacity hover:opacity-100'
                >
                  <X className='h-4 w-4' />
                </ToastPrimitives.Close>
              </motion.div>
            </ToastPrimitives.Root>
          ))}
        </AnimatePresence>
        <ToastPrimitives.Viewport className='fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px]' />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

