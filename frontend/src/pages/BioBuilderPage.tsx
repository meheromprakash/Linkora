import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { BioProfile, BioLink } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { IconButton } from '../components/ui/IconButton';
import { useToast } from '../components/ui/Toast';
import { Skeleton } from '../components/ui/Skeleton';
import {
  User,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Palette,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';

const QUICK_ADD_TEMPLATES = [
  { label: 'Portfolio', url: 'https://myportfolio.com' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/username' },
  { label: 'GitHub', url: 'https://github.com/username' },
  { label: 'WhatsApp', url: 'https://wa.me/1234567890' },
  { label: 'Email', url: 'mailto:user@example.com' },
];

export const BioBuilderPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user's bio profile
  const { data: bioResponse, isLoading } = useQuery<{ data: BioProfile }>({
    queryKey: ['myBio'],
    queryFn: () => api.get('/bio/me'),
  });

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<'minimal-light' | 'dark-slate' | 'gradient-neon'>('gradient-neon');
  const [links, setLinks] = useState<BioLink[]>([]);
  const [socials, setSocials] = useState<{
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  }>({});

  const [savedState, setSavedState] = useState<string>('');
  const [copiedRoute, setCopiedRoute] = useState(false);

  useEffect(() => {
    if (bioResponse?.data) {
      const p = bioResponse.data;
      setUsername(p.username || '');
      setDisplayName(p.displayName || '');
      setBio(p.bio || '');
      setAvatarUrl(p.avatarUrl || '');
      setTheme(p.theme || 'gradient-neon');
      setLinks(p.links || []);
      setSocials(p.socials || {});

      // Serialize for unsaved changes comparison
      setSavedState(
        JSON.stringify({
          username: p.username || '',
          displayName: p.displayName || '',
          bio: p.bio || '',
          avatarUrl: p.avatarUrl || '',
          theme: p.theme || 'gradient-neon',
          links: p.links || [],
          socials: p.socials || {},
        })
      );
    }
  }, [bioResponse]);

  const currentState = JSON.stringify({
    username,
    displayName,
    bio,
    avatarUrl,
    theme,
    links,
    socials,
  });

  const hasUnsavedChanges = useMemo(() => {
    return savedState !== '' && savedState !== currentState;
  }, [savedState, currentState]);

  // Update bio profile mutation
  const updateBioMutation = useMutation({
    mutationFn: (data: Partial<BioProfile>) => api.put('/bio/me', data),
    onSuccess: () => {
      toast('Bio profile saved successfully!', 'success');
      setSavedState(currentState);
      queryClient.invalidateQueries({ queryKey: ['myBio'] });
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to update bio profile', 'error');
    },
  });

  const handleSave = () => {
    updateBioMutation.mutate({
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      theme,
      links,
      socials,
    });
  };

  const addLink = (title = 'New Link', url = 'https://example.com') => {
    const newLink: BioLink = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      url,
      isActive: true,
      order: links.length + 1,
    };
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: keyof BioLink, value: any) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const publicUrl = `${window.location.origin}/bio/${username}`;

  const copyPublicRoute = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedRoute(true);
    toast('Public profile URL copied!', 'success');
    setTimeout(() => setCopiedRoute(false), 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Sticky Header with Unsaved Changes Indicator */}
        <PageHeader
          title="Bio-Link Profile Builder"
          subtitle="Customize your link-in-bio profile layout, theme styles, and social handles with real-time phone preview."
          actions={
            <>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
                  View Live Profile
                </Button>
              </a>
              <Button
                variant="primary"
                size="sm"
                isLoading={updateBioMutation.isPending}
                onClick={handleSave}
                icon={
                  hasUnsavedChanges ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-subtle shrink-0" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )
                }
              >
                <span>Save Changes</span>
                {hasUnsavedChanges && <span className="text-[10px] font-bold text-emerald-200 ml-1">•</span>}
              </Button>
            </>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-full h-48" />
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <Skeleton className="w-72 h-[550px] rounded-[40px]" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Customizer Controls Form (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Identity Settings */}
              <Card className="p-6 space-y-4 bg-white border border-slate-200/90 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-600" />
                    <span>Profile Identity</span>
                  </h2>
                  {username && (
                    <button
                      type="button"
                      onClick={copyPublicRoute}
                      className="text-xs font-mono text-brand-700 hover:underline flex items-center gap-1"
                    >
                      <span>/bio/{username}</span>
                      {copiedRoute ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Username Handle"
                    placeholder="alexrivera"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    helperText="Your unique public profile route"
                    required
                  />
                  <Input
                    label="Display Name"
                    placeholder="Alex Rivera"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Bio Description"
                  placeholder="Product designer & builder. Sharing useful tools and articles."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  helperText="Short bio text displayed under your avatar"
                />
                <Input
                  label="Avatar Image URL"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  helperText="Direct link to a round profile photo"
                />
              </Card>

              {/* Theme Swatch Cards Selector */}
              <Card className="p-6 space-y-4 bg-white border border-slate-200/90 shadow-card">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-brand-600" />
                  <span>Theme Styling</span>
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: 'minimal-light',
                      label: 'Minimal Light',
                      previewBg: 'bg-slate-100 text-slate-900 border-slate-300',
                      pillBg: 'bg-white border-slate-200 text-slate-800',
                    },
                    {
                      id: 'dark-slate',
                      label: 'Dark Slate',
                      previewBg: 'bg-[#1E293B] text-slate-100 border-slate-600',
                      pillBg: 'bg-[#334155] border-slate-500 text-slate-200',
                    },
                    {
                      id: 'gradient-neon',
                      label: 'Gradient Neon',
                      previewBg: 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-emerald-400 border-emerald-500/50',
                      pillBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
                    },
                  ].map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id as any)}
                        className={clsx(
                          'relative p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all duration-200 overflow-hidden group focus:outline-none',
                          t.previewBg,
                          isSelected
                            ? 'ring-2 ring-brand-600 border-brand-600 shadow-md scale-[1.02]'
                            : 'opacity-80 hover:opacity-100 border-slate-200'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 p-0.5 rounded-full bg-brand-600 text-white">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {/* Mini Real Preview */}
                        <div className="w-full space-y-1 py-1">
                          <div className="w-6 h-6 rounded-full bg-current opacity-40 mx-auto" />
                          <div className={clsx('w-full h-3 rounded-md text-[9px] font-bold flex items-center justify-center border', t.pillBg)}>
                            Link
                          </div>
                        </div>
                        <span className="text-xs font-semibold leading-none">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Bio Links Manager */}
              <Card className="p-6 space-y-4 bg-white border border-slate-200/90 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span>Bio Links ({links.length})</span>
                  </h2>
                  <Button variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => addLink()}>
                    Custom Link
                  </Button>
                </div>

                {/* Quick Add Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs text-slate-500 font-medium mr-1">Quick Add:</span>
                  {QUICK_ADD_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => addLink(tmpl.label, tmpl.url)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      + {tmpl.label}
                    </button>
                  ))}
                </div>

                {/* Link Input Row Cards or 0-Link Empty State */}
                {links.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200/90 rounded-xl space-y-2 bg-slate-50/50 mt-2">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No links yet</p>
                    <p className="text-xs text-slate-500">Use Quick Add above or add a custom link.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all duration-200"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                          <Input
                            placeholder="Title (e.g. My Portfolio)"
                            value={link.title}
                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                          />
                          <Input
                            placeholder="Destination URL (e.g. https://...)"
                            value={link.url}
                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-end shrink-0">
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            label="Remove link"
                            tooltip="Remove"
                            variant="danger"
                            onClick={() => removeLink(link.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Social Handles */}
              <Card className="p-6 space-y-4 bg-white border border-slate-200/90 shadow-card">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" />
                  <span>Social Handles</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="GitHub"
                    placeholder="https://github.com/username"
                    value={socials.github || ''}
                    onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                  />
                  <Input
                    label="Twitter / X"
                    placeholder="https://twitter.com/username"
                    value={socials.twitter || ''}
                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                  />
                  <Input
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/username"
                    value={socials.linkedin || ''}
                    onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                  />
                  <Input
                    label="Website"
                    placeholder="https://yourwebsite.com"
                    value={socials.website || ''}
                    onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                  />
                </div>
              </Card>
            </div>

            {/* Sticky Smartphone Frame Preview (Right 5 Cols) */}
            <div className="lg:col-span-5 sticky top-8">
              <div className="text-center font-semibold text-xs text-slate-500 uppercase tracking-widest mb-3">
                Live Phone Preview
              </div>

              {/* Phone Bezel */}
              <div className="w-full max-w-[340px] mx-auto h-[620px] bg-[#F1F5F9] border-4 border-slate-300 rounded-[40px] shadow-modal p-4 overflow-hidden relative flex flex-col">
                {/* Phone Speaker Notch */}
                <div className="w-24 h-4 bg-slate-300 rounded-b-xl mx-auto mb-4 shrink-0" />

                {/* Inner Screen Preview Container with 300ms theme transition */}
                <div
                  className={clsx(
                    'flex-1 rounded-[28px] p-5 overflow-y-auto flex flex-col items-center text-center transition-colors duration-300 shadow-inner',
                    theme === 'minimal-light' && 'bg-slate-50 text-slate-900',
                    theme === 'dark-slate' && 'bg-[#0B1324] text-slate-100',
                    theme === 'gradient-neon' && 'bg-gradient-to-b from-[#090D16] via-[#0F241A] to-[#090D16] text-white'
                  )}
                >
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full border-2 border-brand-600/80 p-0.5 mb-3 shrink-0 overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-xl text-slate-700 shadow-md">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      displayName[0] || 'V'
                    )}
                  </div>

                  <h3 className="font-bold text-lg tracking-tight mb-1">{displayName || 'Your Name'}</h3>
                  <p className="text-xs opacity-75 mb-4 line-clamp-2">{bio || 'Your bio description will appear here.'}</p>

                  {/* Stacked Bio Link Buttons or Faint Dashed Ghost Buttons when 0 links */}
                  <div className="w-full space-y-2.5 my-auto">
                    {links.length === 0 ? (
                      [1, 2, 3].map((ghostId) => (
                        <div
                          key={ghostId}
                          className={clsx(
                            'w-full py-3 px-4 rounded-xl border border-dashed text-center text-xs font-medium transition-all opacity-60',
                            theme === 'minimal-light' && 'border-slate-300 text-slate-400 bg-slate-100/50',
                            theme === 'dark-slate' && 'border-slate-700 text-slate-500 bg-slate-800/30',
                            theme === 'gradient-neon' && 'border-emerald-500/30 text-emerald-500/50 bg-emerald-500/5'
                          )}
                        >
                          Your links will appear here
                        </div>
                      ))
                    ) : (
                      links.map((link) => (
                        <div
                          key={link.id}
                          className={clsx(
                            'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center shadow-sm hover:scale-[1.02] animate-fade-in-up',
                            theme === 'minimal-light' &&
                              'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100',
                            theme === 'dark-slate' &&
                              'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700',
                            theme === 'gradient-neon' &&
                              'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                          )}
                        >
                          {link.title || 'Untitled Link'}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pinned Social Icons */}
                  <div className="flex items-center justify-center gap-3 pt-4 shrink-0 opacity-80 mt-auto">
                    {socials.github && <Github className="w-4 h-4" />}
                    {socials.twitter && <Twitter className="w-4 h-4" />}
                    {socials.linkedin && <Linkedin className="w-4 h-4" />}
                    {socials.website && <Globe className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
