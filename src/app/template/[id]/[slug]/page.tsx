'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, Eye, ChevronLeft, ChevronRight, Loader2, Share2, Check, FileCode, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface TemplateDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  folder_path: string;
  screenshot_url: string | null;
  category: string;
  file_count: number;
  download_count: number;
  view_count: number;
  created_at: string;
}

function SkeletonDetail() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="h-10 bg-gray-200 rounded w-2/3" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="aspect-video bg-gray-200 rounded-2xl" />
      <div className="flex gap-4">
        <div className="h-12 bg-gray-200 rounded-xl flex-1" />
        <div className="h-12 bg-gray-200 rounded-xl flex-1" />
      </div>
    </div>
  );
}

export default function TemplateDetailPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [neighbors, setNeighbors] = useState<{ prev: TemplateDetail | null; next: TemplateDetail | null }>({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/templates/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setTemplate(data.template);
        setNeighbors(data.neighbors || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (<div className="min-h-screen bg-white"><SkeletonDetail /></div>);

  if (!template) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
      <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center"><FileCode className="w-10 h-10 text-red-400" /></div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Template Not Found</h1>
        <p className="text-gray-500 mt-2">This template may have been removed or doesn&apos;t exist.</p>
      </div>
      <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">Browse All Templates</Link>
    </div>
  );

  const displayName = template.name.replace(/-html$/, '').replace(/-/g, ' ');

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const handleDownload = () => { setDownloading(true); window.open(`/api/templates/${id}/download`, '_blank'); setTimeout(() => setDownloading(false), 1000); };

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Hub</Link>
          <div className="flex items-center gap-3">
            <button onClick={handleCopyLink} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}</button>
            <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-70 transition-all">{downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Download</button>
            <button onClick={() => window.open(`/api/templates/${id}/preview`, '_blank')} className="flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"><ExternalLink className="w-4 h-4" />Preview</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              {template.category && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">{template.category}</span>}
              <span className="text-xs text-gray-400">Added {new Date(template.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 capitalize leading-tight">{displayName}</h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">{template.description || `A professional-grade ${template.category?.toLowerCase() || 'HTML'} template featuring modern design patterns, responsive layout, and clean code.`}</p>
            <div className="flex items-center gap-6 pt-2">
              <span className="flex items-center gap-2 text-sm text-gray-500"><Eye className="w-4 h-4" />{template.view_count || 0} views</span>
              <span className="flex items-center gap-2 text-sm text-gray-500"><Download className="w-4 h-4" />{template.download_count || 0} downloads</span>
              {template.file_count && <span className="flex items-center gap-2 text-sm text-gray-500"><Layers className="w-4 h-4" />{template.file_count} files</span>}
            </div>
          </div>

          <div className="relative aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
            {template.screenshot_url ? (
              <img src={template.screenshot_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center"><FileCode className="w-16 h-16 text-gray-400 mx-auto mb-3" /><p className="text-gray-500 font-medium">Preview not available</p></div>
              </div>
            )}
          </div>

          <div className="flex sm:hidden gap-3">
            <button onClick={handleDownload} disabled={downloading} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-70 transition-all">{downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Download</button>
            <button onClick={() => window.open(`/api/templates/${id}/preview`, '_blank')} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"><ExternalLink className="w-4 h-4" />Preview</button>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {neighbors.prev ? (
              <Link href={`/template/${neighbors.prev.id}/${neighbors.prev.slug}`} className="group p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <ChevronLeft className="w-5 h-5 text-gray-400 mt-0.5 shrink-0 group-hover:text-gray-600 transition-colors" />
                  <div><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Previous</span><h4 className="text-base font-bold text-gray-900 mt-1 capitalize group-hover:text-blue-600 transition-colors line-clamp-1">{neighbors.prev.name.replace(/-html$/, '').replace(/-/g, ' ')}</h4></div>
                </div>
              </Link>
            ) : <div />}
            {neighbors.next ? (
              <Link href={`/template/${neighbors.next.id}/${neighbors.next.slug}`} className="group p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-right">
                <div className="flex items-start gap-3 justify-end">
                  <div><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next</span><h4 className="text-base font-bold text-gray-900 mt-1 capitalize group-hover:text-blue-600 transition-colors line-clamp-1">{neighbors.next.name.replace(/-html$/, '').replace(/-/g, ' ')}</h4></div>
                  <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5 shrink-0 group-hover:text-gray-600 transition-colors" />
                </div>
              </Link>
            ) : <div />}
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-gray-100 mt-16 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-lg tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-black text-xs">H</span></div>
            TemplateHub
          </Link>
          <p className="text-sm text-gray-400 mt-3">Premium HTML Templates Collection</p>
        </div>
      </footer>
    </div>
  );
}
