import React from 'react';
import { Card } from './Card';
import { AnimatedNumber } from './AnimatedNumber';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  subtext?: string;
  isNumericValue?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtext,
  isNumericValue = true,
}) => {
  return (
    <Card hoverable className="flex flex-col justify-between h-full min-h-[112px] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-1.5">
        <div className="tracking-tight">
          {isNumericValue && typeof value === 'number' ? (
            <span className="text-[32px] font-[650] text-slate-900 leading-none inline-block">
              <AnimatedNumber value={value} />
            </span>
          ) : (
            <span className="text-[20px] font-semibold text-slate-900 leading-tight truncate block max-w-full">
              {value}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-slate-400 mt-1 font-normal truncate">
            {subtext}
          </p>
        )}
      </div>
    </Card>
  );
};
