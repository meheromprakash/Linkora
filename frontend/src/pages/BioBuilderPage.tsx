import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { BioProfile, BioLink } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
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
  Instagram,
  Youtube,
  GripVertical,
} from 'lucide-react';
import { clsx } from 'clsx';

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
    }
  }, [bioResponse]);

  // Update bio profile mutation
  const updateBioMutation = useMutation({
    mutationFn: (data: Partial<BioProfile>) => api.put('/bio/me', data),
    onSuccess: (res: any) => {
      toast('Bio profile saved successfully!', 'success');
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

  const addLink = () => {
    const newLink: BioLink = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'New Bio Link',
      url: 'https://example.com',
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

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Bio-Link Profile Builder</h1>
          <p className="text-xs text-slate-400">
            Customize your link-in-bio profile layout, theme styles, and social handles with real-time preview.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading bio customizer...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customizer Controls (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Identity Settings */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-neon" /> Profile Identity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Username Slug"
                  placeholder="alexrivera"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  helperText={`Public route: /bio/${username}`}
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
                placeholder="Tell your audience about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <Input
                label="Avatar Image URL"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </Card>

            {/* Theme Selector */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" /> Theme Styling
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'minimal-light', label: 'Minimal Light', bg: 'bg-slate-100 text-slate-900 border-slate-300' },
                  { id: 'dark-slate', label: 'Dark Slate', bg: 'bg-slate-900 text-slate-100 border-slate-700' },
                  { id: 'gradient-neon', label: 'Gradient Neon', bg: 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-brand-neon border-brand-neon' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={clsx(
                      'p-4 rounded-xl border text-center font-bold text-xs transition-all duration-200',
                      t.bg,
                      theme === t.id ? 'ring-2 ring-brand-neon ring-offset-2 ring-offset-[#090d16]' : 'opacity-70 hover:opacity-100'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Bio Links Manager */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" /> Bio Links ({links.length})
                </h2>
                <Button variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={addLink}>
                  Add Link
                </Button>
              </div>

              <div className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Link Title (e.g. My GitHub Repo)"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="Destination URL (e.g. https://github.com)"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:bg-rose-500/10"
                        onClick={() => removeLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Social Handles */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" /> Social Handles
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

          {/* Live Mobile Screen Frame Preview (Right 5 Cols) */}
          <div className="lg:col-span-5 sticky top-6">
            <div className="text-center font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">
              Live Mobile Preview
            </div>

            {/* Simulated Smartphone Container */}
            <div className="w-full max-w-[340px] mx-auto h-[620px] bg-black border-4 border-slate-800 rounded-[40px] shadow-2xl p-4 overflow-hidden relative flex flex-col">
              {/* Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto mb-4 shrink-0" />

              {/* Inner Screen Display with Theme Styles */}
              <div
                className={clsx(
                  'flex-1 rounded-[28px] p-6 overflow-y-auto flex flex-col items-center text-center transition-all duration-300',
                  theme === 'minimal-light' && 'bg-slate-50 text-slate-900',
                  theme === 'dark-slate' && 'bg-slate-900 text-slate-100',
                  theme === 'gradient-neon' && 'bg-gradient-to-b from-[#090d16] via-[#0f1f18] to-[#090d16] text-white'
                )}
              >
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full border-2 border-brand-neon p-0.5 mb-3 shrink-0 overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-xl text-brand-neon">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    displayName[0] || 'U'
                  )}
                </div>

                <h3 className="font-extrabold text-lg tracking-tight mb-1">{displayName || 'Your Name'}</h3>
                <p className="text-xs opacity-70 mb-4 line-clamp-2">{bio || 'Your bio description will appear here.'}</p>

                {/* Bio Links List */}
                <div className="w-full space-y-2.5 my-auto">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className={clsx(
                        'w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center shadow-md',
                        theme === 'minimal-light' && 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100',
                        theme === 'dark-slate' && 'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700',
                        theme === 'gradient-neon' && 'bg-brand-neon/15 border border-brand-neon/40 text-brand-neon hover:bg-brand-neon/25'
                      )}
                    >
                      {link.title}
                    </div>
                  ))}
                </div>

                {/* Social Icons Footer */}
                <div className="flex items-center justify-center gap-3 pt-4 shrink-0 opacity-80">
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
    </DashboardLayout>
  );
};
