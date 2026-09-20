import React, { useState } from 'react';
import { Link2, Sparkles, ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface CossActionInputProps {
  url: string;
  setUrl: (val: string) => void;
  customSlug: string;
  setCustomSlug: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

/**
 * Coss UI Particle: Action Input Group
 * Standardized Coss UI pattern combining input primitive, inline status/clear actions,
 * expandable options, and high-contrast action button.
 */
export const CossActionInput: React.FC<CossActionInputProps> = ({
  url,
  setUrl,
  customSlug,
  setCustomSlug,
  title,
  setTitle,
  onSubmit,
  isLoading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Main Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-0 flex items-center">
            <div className="absolute left-3.5 text-brand-600 pointer-events-none flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="url"
              placeholder="Paste a long URL here (e.g. https://example.com/very-long-path)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full bg-slate-50/60 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-9 py-2.5 sm:py-3 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 shadow-inner"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !url}
            className={clsx(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm shrink-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30',
              url
                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20 shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
            )}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{isLoading ? 'Shortening...' : 'Shorten URL'}</span>
          </button>
        </div>

        {/* Expandable Vanity Options Header */}
        <div className="pt-1 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-slate-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors focus:outline-none py-1"
          >
            <span>{showAdvanced ? 'Hide advanced options' : '+ Custom Vanity Slug & Title'}</span>
            <ChevronDown
              className={clsx('w-3.5 h-3.5 transition-transform duration-200', showAdvanced && 'rotate-180')}
            />
          </button>
        </div>

        {/* Expandable Coss UI Options Panel */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 animate-fade-in-up">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Custom Vanity Slug (Optional)</label>
              <input
                type="text"
                placeholder="e.g. summer-sale"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                className="w-full bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-600/25 focus:border-brand-600 shadow-sm"
              />
              <span className="text-[11px] text-slate-400">Collision-protected custom alias</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Link Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Q3 Marketing Campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-600/25 focus:border-brand-600 shadow-sm"
              />
              <span className="text-[11px] text-slate-400">Friendly name for identification</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
