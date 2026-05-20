'use client';

import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export default function LoadMoreButton({
  onClick,
  loading,
  hasMore,
  currentPage,
  totalPages,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
        You have reached the end — {totalPages} page{totalPages > 1 ? 's' : ''} of templates
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 px-8 py-3 bg-white border border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text)] hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>Load More Templates ({currentPage} of {totalPages})</>
        )}
      </button>
    </div>
  );
}
