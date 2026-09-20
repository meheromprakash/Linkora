import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SummaryStats, ShortLink } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { QRModal } from '../components/QRModal';
import { clsx } from 'clsx';
import {
  Link2,
  MousePointerClick,
  CheckCircle2,
  Trophy,
  Plus,
  Copy,
  QrCode,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedQRLink, setSelectedQRLink] = useState<{ url: string; title: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['summaryStats'] }),
        queryClient.refetchQueries({ queryKey: ['recentLinks'] }),
      ]);
      toast('Dashboard metrics refreshed', 'success');
    } catch (err) {
      toast('Failed to refresh dashboard metrics', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch summary stats
  const { data: summaryResponse, isLoading: isSummaryLoading } = useQuery<{ data: SummaryStats }>({
    queryKey: ['summaryStats'],
    queryFn: () => api.get('/analytics/summary'),
  });

  // Fetch recent links
  const { data: linksResponse, isLoading: isLinksLoading } = useQuery<{
    data: { links: ShortLink[] };
  }>({
    queryKey: ['recentLinks'],
    queryFn: () => api.get('/links?limit=5'),
  });

  const stats = summaryResponse?.data;
  const recentLinks = linksResponse?.data?.links || [];

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: (newLink: { originalUrl: string; customSlug?: string; title?: string }) =>
      api.post('/links', newLink),
    onSuccess: (res: any) => {
      toast('Short link created successfully!', 'success');
      setUrl('');
      setCustomSlug('');
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['summaryStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentLinks'] });
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to create short link', 'error');
    },
  });

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    createLinkMutation.mutate({
      originalUrl: url,
      customSlug: customSlug ? customSlug.trim() : undefined,
      title: title ? title.trim() : undefined,
    });
  };

  const copyToClipboard = (shortCode: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    toast('Short link copied to clipboard!', 'success');
  };

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-400">
            Monitor link metrics, track click performance, and shorten URLs instantly.
          </p>
        </div>
        <Link to="/links">
          <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
            Manage All Links
          </Button>
        </Link>
      </div>

      {/* Quick Shorten Bar Card */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border-brand-neon/30 glow-brand">
        <form onSubmit={handleCreateLink} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <Input
                type="url"
                placeholder="Paste long URL here (e.g. https://github.com/com-bot/assessment)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                leftIcon={<Link2 className="w-4 h-4 text-brand-neon" />}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto shrink-0"
              isLoading={createLinkMutation.isPending}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Shorten URL
            </Button>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-brand-neon hover:underline font-medium flex items-center gap-1"
            >
              {showAdvanced ? 'Hide Custom Options' : '+ Custom Vanity Slug & Title'}
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 animate-fadeIn">
              <Input
                label="Custom Vanity Slug (Optional)"
                placeholder="e.g. my-brand"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                helperText="Collision protected unique slug"
              />
              <Input
                label="Link Title (Optional)"
                placeholder="e.g. Q3 Marketing Docs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          )}
        </form>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center text-brand-neon">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Short Links</p>
            <h3 className="text-2xl font-black text-slate-100">
              {isSummaryLoading ? '...' : stats?.totalLinks || 0}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Clicks Recorded</p>
            <h3 className="text-2xl font-black text-slate-100">
              {isSummaryLoading ? '...' : stats?.totalClicks || 0}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Links</p>
            <h3 className="text-2xl font-black text-slate-100">
              {isSummaryLoading ? '...' : stats?.activeLinks || 0}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">Top Performing Link</p>
            <h3 className="text-sm font-bold text-slate-100 truncate">
              {isSummaryLoading ? '...' : stats?.topLink ? stats.topLink.title : 'None yet'}
            </h3>
            {stats?.topLink && (
              <span className="text-xs text-brand-neon font-mono">
                {stats.topLink.clickCount} clicks
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Links Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">Recent Short Links</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
              title="Refresh click and analytics data"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin text-brand-neon")} />
              <span>Refresh</span>
            </button>
            <Link to="/links" className="text-xs text-brand-neon hover:underline font-semibold">
              View All →
            </Link>
          </div>
        </div>

        {isLinksLoading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading recent links...</div>
        ) : recentLinks.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Link2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No short links created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title & Original URL</th>
                  <th className="py-3 px-4">Short Link</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentLinks.map((link) => {
                  const shortUrl = `${window.location.origin}/r/${link.shortCode}`;
                  return (
                    <tr key={link._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-200 truncate">{link.title}</div>
                        <div className="text-xs text-slate-400 truncate">{link.originalUrl}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-brand-neon">
                        /r/{link.shortCode}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-neon/10 text-brand-neon border border-brand-neon/20">
                          {link.clickCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Copy link"
                            onClick={() => copyToClipboard(link.shortCode)}
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-300" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View QR Code"
                            onClick={() => setSelectedQRLink({ url: shortUrl, title: link.title })}
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-300" />
                          </Button>
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Test redirect"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* QR Code Modal */}
      {selectedQRLink && (
        <QRModal
          isOpen={!!selectedQRLink}
          onClose={() => setSelectedQRLink(null)}
          shortUrl={selectedQRLink.url}
          title={selectedQRLink.title}
        />
      )}
    </DashboardLayout>
  );
};
