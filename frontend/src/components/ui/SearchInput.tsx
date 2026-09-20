import React, { forwardRef, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightElement'> {
  showShortcutHint?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ showShortcutHint = true, className, placeholder = 'Search short links...', ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement | null>(null);

    // Combine forwarded ref and internal ref
    const setRef = (element: HTMLInputElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
      }
    };

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          internalRef.current?.focus();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform || '');

    const shortcutHint = (
      <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-[11px] font-mono text-slate-500 select-none">
        <span>{isMac ? '⌘' : 'Ctrl'}</span>
        <span>K</span>
      </div>
    );

    return (
      <Input
        ref={setRef}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        rightElement={showShortcutHint ? shortcutHint : undefined}
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
