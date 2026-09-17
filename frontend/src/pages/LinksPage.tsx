import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ShortLink } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { QRModal } from '../components/QRModal';
import {
  Link2,
  Search,
  Plus,
  Copy,
  QrCode,
  ExternalLink,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const LinksPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedQRLink, setSelectedQRLink] = useState<{ url: string; title: string } | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<ShortLink | null>(null);

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

  const links = linksResponse?.data?.links || [];
  const pagination = linksResponse?.data?.pagination;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { originalUrl: string; customSlug?: string; title?: string }) =>
      api.post('/links', data),
    onSuccess: () => {
      toast('Short link created successfully!', 'success');
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

  const handleCopy = (shortCode: string) => {
    const fullUrl = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    toast('Copied short URL to clipboard!', 'success');
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Link Library</h1>
          <p className="text-xs text-slate-400">
            Search, manage, copy, and inspect QR codes for all your branded short URLs.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Short Link
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search by title, short code, custom slug, or destination URL..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          Showing {links.length} of {pagination?.total || 0} links
        </div>
      </Card>

      {/* Links List / Table */}
      <Card className="p-0 overflow-hidden border-slate-800">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading link library...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Link2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No short links found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search
                ? `No links matched your search term "${search}".`
                : 'Create your first branded short link to get started.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {links.map((link) => {
              const shortUrl = `${window.location.origin}/r/${link.shortCode}`;
              return (
                <div
                  key={link._id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/60 transition"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-100 text-base truncate">{link.title}</h3>
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: link._id,
                            isActive: !link.isActive,
                          })
                        }
                      >
                        <Badge variant={link.isActive ? 'success' : 'default'}>
                          {link.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-brand-neon font-semibold">{shortUrl}</span>
                      <button
                        onClick={() => handleCopy(link.shortCode)}
                        className="text-slate-400 hover:text-white p-1 rounded"
                        title="Copy short link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 truncate max-w-xl">{link.originalUrl}</p>

                    {link.tags && link.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {link.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-center px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block font-medium">Clicks</span>
                      <span className="text-base font-black text-brand-neon">
                        {link.clickCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<QrCode className="w-4 h-4" />}
                        onClick={() => setSelectedQRLink({ url: shortUrl, title: link.title })}
                      >
                        QR Code
                      </Button>
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        title="Open short link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        onClick={() => setLinkToDelete(link)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginator */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
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
      </Card>

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
            helperText="Custom slug with collision check"
          />

          <Input
            label="Link Title (Optional)"
            type="text"
            placeholder="e.g. Campaign Landing Page"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Short Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {linkToDelete && (
        <Modal
          isOpen={!!linkToDelete}
          onClose={() => setLinkToDelete(null)}
          title="Delete Short Link"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete short link <strong>"{linkToDelete.title}"</strong> (/r/
              {linkToDelete.shortCode})? This action will permanently remove click telemetry data.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setLinkToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(linkToDelete._id)}
              >
                Delete Link
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
