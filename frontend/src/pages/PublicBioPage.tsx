import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { BioProfile } from '../types';
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

export const PublicBioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  const { data: response, isLoading, error } = useQuery<{ data: BioProfile }>({
    queryKey: ['publicBio', username],
    queryFn: () => api.get(`/bio/public/${username}`),
    retry: 1,
  });

  const bioData = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 text-sm">
        Loading bio profile...
      </div>
    );
  }

  if (error || !bioData) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="text-3xl font-black text-brand-neon">404 - Profile Not Found</h1>
        <p className="text-slate-400 max-w-sm">
          The public bio profile <strong>/bio/{username}</strong> does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-brand-neon text-slate-950 font-bold rounded-xl shadow-lg hover:bg-[#32c96c] transition"
        >
          Go to Linkora Home
        </Link>
      </div>
    );
  }

  const theme = bioData.theme || 'gradient-neon';

  return (
    <div
      className={clsx(
        'min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 transition-colors duration-300',
        theme === 'minimal-light' && 'bg-slate-100 text-slate-900',
        theme === 'dark-slate' && 'bg-[#0b1324] text-slate-100',
        theme === 'gradient-neon' && 'bg-gradient-to-b from-[#090d16] via-[#0f241a] to-[#090d16] text-white'
      )}
    >
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center text-center space-y-6 py-8">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full border-4 border-brand-neon/60 p-0.5 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-3xl text-brand-neon shrink-0">
          {bioData.avatarUrl ? (
            <img
              src={bioData.avatarUrl}
              alt={bioData.displayName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            bioData.displayName[0] || 'U'
          )}
        </div>

        {/* Display Name & Bio */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">{bioData.displayName}</h1>
          {bioData.bio && <p className="text-sm opacity-80 max-w-xs mx-auto leading-relaxed">{bioData.bio}</p>}
        </div>

        {/* Bio Links Cards */}
        <div className="w-full space-y-3 pt-2">
          {bioData.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={clsx(
                'w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-between shadow-xl hover:scale-[1.02] active:scale-[0.98]',
                theme === 'minimal-light' &&
                  'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:shadow-2xl',
                theme === 'dark-slate' &&
                  'bg-slate-900 text-slate-100 border border-slate-800 hover:bg-slate-800 hover:border-slate-700',
                theme === 'gradient-neon' &&
                  'bg-brand-neon/15 border border-brand-neon/40 text-brand-neon hover:bg-brand-neon/25 shadow-brand-neon/10'
              )}
            >
              <span className="truncate flex-1 text-center">{link.title}</span>
              <ExternalLink className="w-4 h-4 shrink-0 opacity-60" />
            </a>
          ))}
        </div>

        {/* Social Icons */}
        {bioData.socials && (
          <div className="flex items-center justify-center gap-4 pt-4">
            {bioData.socials.github && (
              <a href={bioData.socials.github} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-black/20 hover:scale-110 transition">
                <Github className="w-5 h-5" />
              </a>
            )}
            {bioData.socials.twitter && (
              <a href={bioData.socials.twitter} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-black/20 hover:scale-110 transition">
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {bioData.socials.linkedin && (
              <a href={bioData.socials.linkedin} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-black/20 hover:scale-110 transition">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {bioData.socials.website && (
              <a href={bioData.socials.website} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-black/20 hover:scale-110 transition">
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Branded Footer Badge */}
      <footer className="py-4 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <img src="/logo.svg" alt="Linkora" className="w-4 h-4" />
          <span>Powered by <strong>Linkora</strong></span>
        </Link>
      </footer>
    </div>
  );
};
