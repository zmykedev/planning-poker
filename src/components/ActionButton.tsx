import React from 'react';
import { Button, type ButtonProps } from 'antd';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick' | 'type' | 'ghost'> {
  antDType?: ButtonProps['type'];
  isGhost?: boolean;
  action: 'login' | 'register' | 'scroll';
  target?: string;
  onAction: (action: string, target?: string) => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  antDType = 'default',
  isGhost = false,
  action,
  target,
  onAction,
  children,
  ...buttonProps
}) => {
  return (
    <Button
      type={antDType}
      ghost={isGhost}
      size='large'
      {...buttonProps}
      onClick={() => onAction(action, target)}
      className='shadow-lg'
    >
      {children}
    </Button>
  );
};
