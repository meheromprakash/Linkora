import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 shadow-xl transition-all duration-200 backdrop-blur-sm',
        hoverable && 'hover:border-slate-700 hover:shadow-2xl hover:bg-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
