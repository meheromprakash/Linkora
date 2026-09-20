import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ShortLink } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SearchInput } from '../components/ui/SearchInput';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { IconButton } from '../components/ui/IconButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { QRModal } from '../components/QRModal';
import { clsx } from 'clsx';
import {
  Link2,
  Plus,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';

import { SegmentedControl } from '../components/ui/SegmentedControl';

type SortOption = 'all' | 'newest' | 'most-clicked';

export const LinksPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('all');
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [selectedQRLink, setSelectedQRLink] = useState<{ url: string; title: string } | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<ShortLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Link Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCustomSlug, setNewCustomSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch paginated links
  const { data: linksResponse, isLoading } = useQuery<{
    data: {
      links: ShortLink[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }>({
    queryKey: ['links', page, search],
    queryFn: () => api.get(`/links?page=${page}&limit=10&search=${encodeURIComponent(search)}`),
  });

  const rawLinks = linksResponse?.data?.links || [];
  const pagination = linksResponse?.data?.pagination;

  // Client-side sort/filter on loaded page data
  const filteredLinks = useMemo(() => {
    let result = [...rawLinks];
    if (activeOnly) {
      result = result.filter((l) => l.isActive);
    }
    if (sortOption === 'most-clicked') {
      result.sort((a, b) => b.clickCount - a.clickCount);
    } else if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [rawLinks, sortOption, activeOnly]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { originalUrl: string; customSlug?: string; title?: string }) =>
      api.post('/links', data),
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

      setIsCreateOpen(false);
      setNewUrl('');
      setNewCustomSlug('');
      setNewTitle('');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['summaryStats'] });
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to create short link', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/links/${id}`),
    onSuccess: () => {
      toast('Short link deleted successfully', 'success');
      setLinkToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['summaryStats'] });
    },
    onError: (err: any) => {
      toast(err.message || 'Failed to delete short link', 'error');
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/links/${id}`, { isActive }),
    onSuccess: () => {
      toast('Link status updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const handleCopy = (id: string, shortCode: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(fullUrl)
        .then(() => {
          setCopiedId(id);
          toast('Copied short URL to clipboard!', 'success');
          setTimeout(() => setCopiedId(null), 1500);
        })
        .catch(() => {
          toast('Failed to copy to clipboard', 'error');
        });
    } else {
      toast('Clipboard access unavailable', 'error');
    }
  };

  const getFaviconUrl = (originalUrl: string) => {
    try {
      const parsed = new URL(originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <PageHeader
          title="Link Library"
          subtitle="Search, manage, copy, and inspect QR codes for all your branded short URLs."
          actions={
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Create Short Link
            </Button>
          }
        />

        {/* Search & Filter Toolbar */}
        <Card className="p-4 space-y-3 bg-white border border-slate-200/90 shadow-card">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 max-w-lg">
              <SearchInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Split Controls: Segmented Sorting + Active Only Toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              <SegmentedControl
                size="sm"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Newest', value: 'newest' },
                  { label: 'Most Clicked', value: 'most-clicked' },
                ]}
                value={sortOption}
                onChange={(val) => setSortOption(val)}
              />

              <button
                type="button"
                onClick={() => setActiveOnly(!activeOnly)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 focus:outline-none select-none',
                  activeOnly
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/70 hover:text-slate-900'
                )}
              >
                <span className={clsx('w-2 h-2 rounded-full transition-colors', activeOnly ? 'bg-emerald-500' : 'bg-slate-400')} />
                <span>Active Only</span>
              </button>
            </div>
          </div>
        </Card>

      {/* Links List Cards */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="w-48 h-5" />
                <Skeleton className="w-80 h-4" />
              </div>
              <Skeleton className="w-24 h-8" />
            </Card>
          ))
        ) : filteredLinks.length === 0 ? (
          <EmptyState
            icon={<Link2 />}
            title={search ? 'No matching links found' : 'No short links yet'}
            description={
              search
                ? `No links matched your search term "${search}". Try clearing your search.`
                : 'Create your first short link to start managing your URL library.'
            }
            actionLabel={search ? undefined : 'Create Short Link'}
            onAction={search ? undefined : () => setIsCreateOpen(true)}
          />
        ) : (
          filteredLinks.map((link) => {
            const shortUrl = `${window.location.origin}/r/${link.shortCode}`;
            const favicon = getFaviconUrl(link.originalUrl);
            const isCopied = copiedId === link._id;

            return (
              <Card
                key={link._id}
                hoverable
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 group transition-all duration-200"
              >
                {/* Left Side: Favicon + Title + Badge + Mono Short URL + Truncated Destination */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                    {favicon ? (
                      <img
                        src={favicon}
                        alt=""
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate leading-snug">
                        {link.title || link.originalUrl}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: link._id,
                            isActive: !link.isActive,
                          })
                        }
                        className="focus:outline-none"
                      >
                        <Badge variant={link.isActive ? 'success' : 'default'}>
                          {link.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs border border-slate-200/80">
                        /r/{link.shortCode}
                      </span>
                      <IconButton
                        icon={
                          isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 scale-110 transition-transform" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                        label="Copy link"
                        tooltip={shortUrl}
                        size="sm"
                        onClick={() => handleCopy(link._id, link.shortCode)}
                      />
                    </div>

                    <p className="text-xs text-slate-500 truncate max-w-full sm:max-w-xl leading-normal">
                      {link.originalUrl}
                    </p>
                  </div>
                </div>

                {/* Right Side: Clicks Stat + Ghost Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right px-2.5 sm:px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block">Clicks</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{link.clickCount}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <IconButton
                      icon={<QrCode className="w-4 h-4" />}
                      label="View QR Code"
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
                      aria-label="Open short link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <IconButton
                      icon={<Trash2 className="w-4 h-4" />}
                      label="Delete link"
                      tooltip="Delete link"
                      variant="danger"
                      onClick={() => setLinkToDelete(link)}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-slate-500 text-center sm:text-left">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total links)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Link Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Branded Short Link"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              originalUrl: newUrl,
              customSlug: newCustomSlug ? newCustomSlug.trim() : undefined,
              title: newTitle ? newTitle.trim() : undefined,
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Destination URL"
            type="url"
            placeholder="https://example.com/target-page"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            required
          />

          <Input
            label="Custom Vanity Slug (Optional)"
            type="text"
            placeholder="e.g. launch-2026"
            value={newCustomSlug}
            onChange={(e) => setNewCustomSlug(e.target.value)}
            helperText="Collision-protected custom alias"
          />

          <Input
            label="Link Title (Optional)"
            type="text"
            placeholder="e.g. Campaign Landing Page"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-200/80">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={createMutation.isPending} className="w-full sm:w-auto">
              Create Short Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!linkToDelete}
        onClose={() => setLinkToDelete(null)}
        onConfirm={() => linkToDelete && deleteMutation.mutate(linkToDelete._id)}
        title="Delete Short Link"
        message={`Are you sure you want to delete "${linkToDelete?.title || linkToDelete?.shortCode}"? This action cannot be undone and will remove all recorded click telemetry.`}
        confirmLabel="Delete Link"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

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
