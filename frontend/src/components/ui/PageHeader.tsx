import React from 'react';
import { clsx } from 'clsx';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-200/80 pb-5 sm:pb-6 mb-6 sm:mb-8', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-[26px] font-semibold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
