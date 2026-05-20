'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  ExternalLink,
  Github,
  FileCode,
  Layers,
  Palette,
  Image as ImageIcon,
  Calendar,
  Tag,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TemplateDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  repo_name: string;
  repo_url: string;
  github_owner: string;
  github_repo: string;
  file_count?: number;
  total_size?: number;
  html_files?: string[];
  has_css?: boolean;
  has_js?: boolean;
  has_images?: boolean;
  screenshot_url?: string;
  created_at?: string;
  updated_at?: string;
  prevTemplate?: { id: string; title: string } | null;
  nextTemplate?: { id: string; title: string } | null;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch(`/api/templates/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/');
            return;
          }
          throw new Error('Failed to fetch template');
        }
        const data = await res.json();
        setTemplate(data);
      } catch (error) {
        console.error(error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, [id, router]);

  const handlePreview = () => {
    setPreviewMode(true);
    setPreviewLoading(true);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      window.open(`/api/templates/${id}/download`, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-alt)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-slate-200 rounded" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video bg-slate-200 rounded-xl" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="h-4 w-5/6 bg-slate-200 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-32 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) return null;

  // Preview Mode (ThemeForest-style)
  if (previewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreviewMode(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-300 text-sm font-medium ml-2">
              {template.title} — Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={template.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              Source
            </a>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg transition-colors disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Preview iframe */}
        <div className="flex-1 bg-white relative">
          {previewLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading preview...</span>
              </div>
            </div>
          )}
          <iframe
            src={`/api/templates/${id}/preview`}
            className="w-full h-full border-0"
            onLoad={() => setPreviewLoading(false)}
            title={`${template.title} Preview`}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    );
  }

  // Normal Detail View
  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      {/* Breadcrumb / Nav */}
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all templates
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Image / Screenshot */}
            <div
              className="relative group rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 aspect-video cursor-pointer"
              onClick={handlePreview}
            >
              {template.screenshot_url ? (
                <img
                  src={template.screenshot_url}
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <FileCode className="w-16 h-16 text-slate-400 mb-3" />
                  <span className="text-lg font-medium text-slate-600">{template.title}</span>
                  <span className="text-sm text-slate-400 mt-1">Click to preview</span>
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="p-4 bg-white rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Eye className="w-8 h-8 text-[var(--color-accent)]" />
                </div>
              </div>
              
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md">
                Click to preview
              </div>
            </div>

            {/* Title & Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                    {template.title}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-blue-50 text-[var(--color-accent)] text-sm font-medium rounded-full">
                      {template.category}
                    </span>
                    {template.created_at && (
                      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                        <Calendar className="w-4 h-4" />
                        {new Date(template.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* HTML Files List */}
            {template.html_files && template.html_files.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-[var(--color-accent)]" />
                  Included Pages ({template.html_files.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {template.html_files.map((file) => (
                    <div
                      key={file}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm text-[var(--color-text-muted)]"
                    >
                      <FileCode className="w-4 h-4 text-slate-400" />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation - Previous / Next */}
            <div className="flex items-center justify-between gap-4">
              {template.prevTemplate ? (
                <Link
                  href={`/template/${template.prevTemplate.id}`}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-[var(--color-border)] rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                  <div className="text-left">
                    <p className="text-xs text-[var(--color-text-muted)]">Previous</p>
                    <p className="text-sm font-medium text-[var(--color-text)] truncate max-w-[150px]">
                      {template.prevTemplate.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {template.nextTemplate ? (
                <Link
                  href={`/template/${template.nextTemplate.id}`}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-[var(--color-border)] rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group ml-auto"
                >
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-muted)]">Next</p>
                    <p className="text-sm font-medium text-[var(--color-text)] truncate max-w-[150px]">
                      {template.nextTemplate.title}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)] space-y-3 sticky top-24">
              <button
                onClick={handlePreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl transition-colors"
              >
                <Eye className="w-5 h-5" />
                Live Preview
              </button>
              
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-medium rounded-xl transition-colors disabled:opacity-60"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Preparing...' : 'Download (.zip)'}
              </button>
              
              <a
                href={template.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[var(--color-border)] hover:bg-slate-50 text-[var(--color-text)] font-medium rounded-xl transition-colors"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>

            {/* Template Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">Template Details</h3>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Files
                  </dt>
                  <dd className="text-sm font-medium">{template.file_count || 'N/A'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Category
                  </dt>
                  <dd className="text-sm font-medium">{template.category}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                    <Palette className="w-4 h-4" /> CSS
                  </dt>
                  <dd className="text-sm font-medium">{template.has_css ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                    <FileCode className="w-4 h-4" /> JavaScript
                  </dt>
                  <dd className="text-sm font-medium">{template.has_js ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Images
                  </dt>
                  <dd className="text-sm font-medium">{template.has_images ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
