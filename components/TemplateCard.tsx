'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Download, FileCode, Layers, Palette } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  repo_name: string;
  file_count?: number;
  has_css?: boolean;
  has_js?: boolean;
  has_images?: boolean;
  screenshot_url?: string;
  created_at?: string;
}

interface TemplateCardProps {
  template: Template;
  index: number;
}

export default function TemplateCard({ template, index }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="masonry-item group"
    >
      <Link href={`/template/${template.id}`} className="block">
        <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)] hover:shadow-md hover:border-slate-300 transition-all duration-300">
          {/* Preview Image Area */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            {template.screenshot_url ? (
              <img
                src={template.screenshot_url}
                alt={template.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-4">
                  <FileCode className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {template.category}
                  </span>
                </div>
              </div>
            )}
            
            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-[var(--color-primary)] rounded-md">
                  {template.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md text-[var(--color-primary)] hover:bg-white transition-colors">
                  <Eye className="w-4 h-4" />
                </span>
                <span className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md text-[var(--color-primary)] hover:bg-white transition-colors">
                  <Download className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-[var(--color-text)] mb-1.5 group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
              {template.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3 leading-relaxed">
              {template.description}
            </p>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
              {template.file_count && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {template.file_count} files
                </span>
              )}
              {template.has_css && (
                <span className="flex items-center gap-1" title="Includes CSS">
                  <Palette className="w-3.5 h-3.5" />
                  CSS
                </span>
              )}
              {template.has_js && (
                <span className="flex items-center gap-1" title="Includes JavaScript">
                  <FileCode className="w-3.5 h-3.5" />
                  JS
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
