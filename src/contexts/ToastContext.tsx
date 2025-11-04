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

  const addToast = useCallback((toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 3000);
  }, []);

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
        return (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500'>
            <CheckCircle2 className='h-5 w-5 text-white' />
          </div>
        );
      case 'error':
        return (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-red-500'>
            <AlertCircle className='h-5 w-5 text-white' />
          </div>
        );
      case 'info':
        return (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500'>
            <Info className='h-5 w-5 text-white' />
          </div>
        );
      default:
        return null;
    }
  };

  const variantStyles = {
    default: 'bg-white border-slate-200',
    success: 'bg-white border-green-300 shadow-green-100',
    error: 'bg-white border-red-300 shadow-red-100',
    info: 'bg-white border-blue-300 shadow-blue-100',
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
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                exit={{
                  opacity: 0,
                  x: 100,
                  scale: 0.8,
                  transition: { duration: 0.2 },
                }}
                className={cn(
                  'pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-xl border-2 p-4 pr-12 shadow-2xl backdrop-blur-sm',
                  variantStyles[toast.variant || 'default'],
                )}
              >
                <div className='flex items-center gap-4 flex-1'>
                  {getIcon(toast.variant)}
                  <div className='flex flex-col gap-0.5 flex-1'>
                    {toast.title && (
                      <div className='text-base font-bold text-gray-900 leading-tight'>
                        {toast.title}
                      </div>
                    )}
                    {toast.description && (
                      <div className='text-sm text-gray-600 leading-snug'>{toast.description}</div>
                    )}
                  </div>
                </div>
                <ToastPrimitives.Close className='absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200'>
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
