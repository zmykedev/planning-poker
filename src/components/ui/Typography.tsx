import * as React from 'react';
import { cn } from '../../lib/utils';

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'muted' | 'danger' | 'success';
}

const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'text-slate-900',
      secondary: 'text-slate-700',
      muted: 'text-slate-500',
      danger: 'text-red-600',
      success: 'text-green-600',
    };

    return <span ref={ref} className={cn(variantStyles[variant], className)} {...props} />;
  },
);
Text.displayName = 'Text';

const Title = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn('text-3xl font-bold tracking-tight text-slate-900', className)}
      {...props}
    />
  ),
);
Title.displayName = 'Title';

const Subtitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-xl font-semibold tracking-tight text-slate-900', className)}
      {...props}
    />
  ),
);
Subtitle.displayName = 'Subtitle';

export { Text, Title, Subtitle };
