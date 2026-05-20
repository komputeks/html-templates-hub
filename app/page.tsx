'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import TemplateCard from '@/components/TemplateCard';
import TemplateSkeleton from '@/components/TemplateSkeleton';
import LoadMoreButton from '@/components/LoadMoreButton';
import EmptyState from '@/components/EmptyState';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  repo_name: string;
  repo_url: string;
  file_count?: number;
  has_css?: boolean;
  has_js?: boolean;
  has_images?: boolean;
  screenshot_url?: string;
  created_at?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [syncing, setSyncing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchTemplates = useCallback(async (page = 1, search = '', append = false) => {
    if (append) {
      setLoadingMore(true);
    } else if (page === 1) {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();

      if (append) {
        setTemplates((prev) => [...prev, ...data.data]);
      } else {
        setTemplates(data.data || []);
      }
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoad(false);
    }
  }, [pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Search with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTemplates(1, query);
    }, 300);
  };

  // Load more
  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchTemplates(pagination.page + 1, searchQuery, true);
    }
  };

  // Sync from GitHub
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      console.log('Sync result:', data);
      // Re-fetch templates after sync
      fetchTemplates(1, searchQuery);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const hasMore = pagination.page < pagination.totalPages;
  const showEmpty = !loading && templates.length === 0;
  const showSearchEmpty = showEmpty && searchQuery;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onSync={handleSync}
        syncing={syncing}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {!showEmpty && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">
              Showing{' '}
              <span className="font-medium text-[var(--color-text)]">{templates.length}</span>
              {' '}of{' '}
              <span className="font-medium text-[var(--color-text)]">{pagination.total}</span>
              {' '}templates
              {searchQuery && (
                <span>
                  {' '}for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </span>
              )}
            </p>
          </div>
        )}

        {/* Masonry Grid */}
        {(loading || templates.length > 0) && (
          <div className="masonry-grid">
            {loading && initialLoad ? (
              <TemplateSkeleton count={8} />
            ) : (
              <>
                {templates.map((template, index) => (
                  <TemplateCard key={template.id} template={template} index={index} />
                ))}
                {loadingMore && <TemplateSkeleton count={4} />}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {showEmpty && (
          <EmptyState
            type={showSearchEmpty ? 'search' : 'empty'}
            query={searchQuery}
            onClear={() => handleSearch('')}
          />
        )}

        {/* Load More Button */}
        {!loading && !showEmpty && (
          <LoadMoreButton
            onClick={handleLoadMore}
            loading={loadingMore}
            hasMore={hasMore}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center font-bold text-white text-sm">
                H
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">
                HTML Templates Hub — Free HTML Templates Collection
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
              <span>Powered by Next.js & Supabase</span>
              <a
                href="https://github.com/komputeks"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-accent)] transition-colors"
              >
                @komputeks
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
