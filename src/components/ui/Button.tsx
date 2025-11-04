import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white shadow hover:bg-blue-700 active:bg-blue-800',
        secondary:
          'bg-white text-slate-700 border border-blue-100 shadow-sm hover:bg-blue-50 active:bg-blue-100',
        outline:
          'border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white',
        ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100',
        link: 'text-blue-600 underline-offset-4 hover:underline',
        danger: 'bg-red-600 text-white shadow hover:bg-red-700 active:bg-red-800',
        success: 'bg-green-600 text-white shadow hover:bg-green-700 active:bg-green-800',
      },
      size: {
        small: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        large: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {icon && <span className='inline-flex'>{icon}</span>}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
