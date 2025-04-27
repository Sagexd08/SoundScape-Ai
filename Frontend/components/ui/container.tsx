import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'small' | 'large';
}

export function Container({
  children,
  className,
  size = 'default',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        {
          'max-w-screen-xl': size === 'large',
          'max-w-screen-lg': size === 'default',
          'max-w-screen-md': size === 'small',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
