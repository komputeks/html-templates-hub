'use client';

interface TemplateSkeletonProps {
  count?: number;
}

export default function TemplateSkeleton({ count = 1 }: TemplateSkeletonProps) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="masonry-item">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)]">
        <div className="aspect-[4/3] skeleton" />
        <div className="p-4 space-y-3">
          <div className="h-5 skeleton rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3 skeleton rounded w-full" />
            <div className="h-3 skeleton rounded w-5/6" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-4 skeleton rounded w-14" />
            <div className="h-4 skeleton rounded w-10" />
          </div>
        </div>
      </div>
    </div>
  ));
}
