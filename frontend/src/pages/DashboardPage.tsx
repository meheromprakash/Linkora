import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { SummaryStats, ShortLink, AnalyticsData } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { IconButton } from '../components/ui/IconButton';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { QRModal } from '../components/QRModal';
import { CossActionInput } from '../components/coss/CossActionInput';
import { clsx } from 'clsx';
import {
  Link2,
  MousePointerClick,
  CheckCircle2,
  Trophy,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  Globe,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [title, setTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedQRLink, setSelectedQRLink] = useState<{ url: string; title: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['summaryStats'] }),
        queryClient.refetchQueries({ queryKey: ['recentLinks'] }),
        queryClient.refetchQueries({ queryKey: ['dashboardAnalytics'] }),
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

  // Fetch 7-day analytics for mini chart
  const { data: analyticsResponse } = useQuery<{ data: AnalyticsData }>({
    queryKey: ['dashboardAnalytics'],
    queryFn: () => api.get('/analytics/details?days=7'),
  });

  const stats = summaryResponse?.data;
  const recentLinks = linksResponse?.data?.links || [];
  const clicksOverTime = analyticsResponse?.data?.clicksOverTime || [];

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: (newLink: { originalUrl: string; customSlug?: string; title?: string }) =>
      api.post('/links', newLink),
    onSuccess: (res: any) => {
      const createdLink = res?.data || res;
      const shortCode = createdLink?.shortCode;

      if (shortCode) {
        const fullUrl = `${window.location.origin}/r/${shortCode}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(fullUrl)
            .then(() => {
              toast('✓ Short link copied to clipboard', 'success');
            })
            .catch(() => {
              toast('✓ Short link created (Failed to auto-copy to clipboard)', 'info');
            });
        } else {
          toast('✓ Short link created (Clipboard access unavailable)', 'info');
        }
      } else {
        toast('✓ Short link created successfully!', 'success');
      }

      setUrl('');
      setCustomSlug('');
      setTitle('');
      setShowAdvanced(false);
      queryClient.invalidateQueries({ queryKey: ['summaryStats'] });
      queryClient.invalidateQueries({ queryKey: ['recentLinks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
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

  const copyToClipboard = (id: string, shortCode: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(fullUrl)
        .then(() => {
          setCopiedId(id);
          toast('Short link copied to clipboard!', 'success');
          setTimeout(() => setCopiedId(null), 1500);
        })
        .catch(() => {
          toast('Failed to copy to clipboard', 'error');
        });
    } else {
      toast('Clipboard access unavailable', 'error');
    }
  };

  // Extract domain for favicon
  const getFaviconUrl = (originalUrl: string) => {
    try {
      const parsed = new URL(originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return null;
    }
  };

  // Top performing link text determination
  const topLinkTitle =
    stats?.topLink && stats.topLink.clickCount > 1
      ? stats.topLink.title || `/r/${stats.topLink.shortCode}`
      : 'No clear leader yet';

  const topLinkSubtext =
    stats?.topLink && stats.topLink.clickCount > 1
      ? `${stats.topLink.clickCount} total clicks`
      : 'Requires >1 click';

  // Format date helper (e.g. "Sep 14")
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formattedClicksOverTime = clicksOverTime.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <PageHeader
          title="Dashboard Overview"
          subtitle="Monitor link metrics, track click performance, and shorten URLs instantly."
          actions={
            <Link to="/links">
              <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                Manage All Links
              </Button>
            </Link>
          }
        />

        {/* Coss UI Action Input Particle Component */}
        <CossActionInput
          url={url}
          setUrl={setUrl}
          customSlug={customSlug}
          setCustomSlug={setCustomSlug}
          title={title}
          setTitle={setTitle}
          onSubmit={handleCreateLink}
          isLoading={createLinkMutation.isPending}
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {isSummaryLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-28 p-4 flex flex-col justify-between">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-8 mt-2" />
              </Card>
            ))
          ) : (
            <>
              <StatCard
                label="Total Short Links"
                value={stats?.totalLinks ?? 0}
                icon={<Link2 className="w-4 h-4 text-slate-700" />}
              />
              <StatCard
                label="Total Clicks Recorded"
                value={stats?.totalClicks ?? 0}
                icon={<MousePointerClick className="w-4 h-4 text-slate-700" />}
              />
              <StatCard
                label="Active Links"
                value={stats?.activeLinks ?? 0}
                icon={<CheckCircle2 className="w-4 h-4 text-slate-700" />}
              />
              <StatCard
                label="Top Performing Link"
                value={topLinkTitle}
                subtext={topLinkSubtext}
                isNumericValue={false}
                icon={<Trophy className="w-4 h-4 text-slate-700" />}
              />
            </>
          )}
        </div>

        {/* Recent Short Links Section */}
        <Card className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">Recent Short Links</h2>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none"
                title="Refresh link metrics"
                aria-label="Refresh link metrics"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', isRefreshing && 'animate-spin text-brand-600')} />
              </button>
            </div>
            <Link to="/links" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLinksLoading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                  <Skeleton className="w-48 h-5" />
                  <Skeleton className="w-20 h-5" />
                </div>
              ))}
            </div>
          ) : recentLinks.length === 0 ? (
            <EmptyState
              icon={<Link2 />}
              title="No short links created yet"
              description="Create your first shortened link using the form above to start tracking clicks."
            />
          ) : (
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left text-sm border-collapse min-w-[540px]">
                <thead>
                  <tr className="border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Link Details</th>
                    <th className="py-3 px-3">Short Path</th>
                    <th className="py-3 px-3 text-center">Clicks</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLinks.map((link) => {
                    const shortUrl = `${window.location.origin}/r/${link.shortCode}`;
                    const favicon = getFaviconUrl(link.originalUrl);
                    const isCopied = copiedId === link._id;

                    return (
                      <tr
                        key={link._id}
                        className="hover:bg-slate-50/80 transition-colors duration-150 group"
                      >
                        <td className="py-3.5 px-3 max-w-[200px] sm:max-w-md">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {favicon ? (
                                <img
                                  src={favicon}
                                  alt=""
                                  className="w-4 h-4 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">
                                {link.title || link.originalUrl}
                              </div>
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                {link.originalUrl}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200/60">
                            /r/{link.shortCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {link.clickCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={
                                isCopied ? (
                                  <Check className="w-4 h-4 text-emerald-600 scale-110 transition-transform" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )
                              }
                              label="Copy short link"
                              tooltip="Copy link"
                              onClick={() => copyToClipboard(link._id, link.shortCode)}
                            />
                            <IconButton
                              icon={<QrCode className="w-4 h-4" />}
                              label="View QR code"
                              tooltip="QR Code"
                              onClick={() =>
                                setSelectedQRLink({ url: shortUrl, title: link.title || `/r/${link.shortCode}` })
                              }
                            />
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-150 active:scale-95"
                              title="Open link"
                              aria-label="Open link in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
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

        {/* 7-Day Clicks Mini Chart Card */}
        {formattedClicksOverTime.length > 0 && (
          <Card className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-slate-900">Clicks (Last 7 Days)</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Daily Trend</span>
            </div>
            <div className="h-40 sm:h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedClicksOverTime} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="formattedDate" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax))]}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#0F172A',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="clicks" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

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
