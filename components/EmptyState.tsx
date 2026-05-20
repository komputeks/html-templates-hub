'use client';

import { SearchX, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'empty';
  query?: string;
  onClear?: () => void;
}

export default function EmptyState({ type, query, onClear }: EmptyStateProps) {
  if (type === 'search') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          No templates found
        </h3>
        <p className="text-[var(--color-text-muted)] text-sm mb-4 text-center max-w-md">
          No results for &ldquo;<strong>{query}</strong>&rdquo;. Try a different search term.
        </p>
        {onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-[var(--color-accent)] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
        No templates yet
      </h3>
      <p className="text-[var(--color-text-muted)] text-sm text-center max-w-md">
        Templates will appear here after syncing from GitHub. Click the Sync button to get started.
      </p>
    </div>
  );
}
