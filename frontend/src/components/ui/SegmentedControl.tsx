import React from 'react';
import { clsx } from 'clsx';

export interface Option<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div
      className={clsx(
        'relative inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 select-none shrink-0 whitespace-nowrap',
        className
      )}
    >
      {/* Sliding background pill */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-250 ease-out border border-slate-200/50"
        style={{
          width: `calc(${100 / options.length}% - 2px)`,
          transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 2}px))`,
        }}
      />
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              'relative z-10 flex-1 font-medium transition-colors duration-150 text-center rounded-md whitespace-nowrap min-w-[84px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm',
              isActive ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
