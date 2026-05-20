'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Download, Eye, Grid3X3, List, ChevronLeft, ChevronRight, Loader2, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Template {
  id: number;
  name: string;
  slug: string;
  description: string;
  folder_path: string;
  screenshot_url: string | null;
  category: string;
  download_count: number;
  view_count: number;
  created_at: string;
}

const CATEGORIES = ['All', 'Business', 'Portfolio', 'E-commerce', 'Dashboard', 'Landing', 'Agency', 'SaaS', 'Blog', 'Creative'];

function SkeletonCard() {
  return (
    <div className="masonry-item">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="skeleton aspect-[4/3] rounded-t-xl" />
        <div className="p-4 space-y-3">
          <div className="skeleton h-5 rounded w-3/4" />
          <div className="skeleton h-4 rounded w-full" />
          <div className="skeleton h-4 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, index }: { template: Template; index: number }) {
  const displayName = template.name.replace(/-html$/, '').replace(/-/g, ' ');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      className="masonry-item group"
    >
      <Link href={`/template/${template.id}/${template.slug}`} className="block">
        <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
            {template.screenshot_url ? (
              <img
                src={template.screenshot_url}
                alt={displayName}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
              <span className="text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                {template.category || 'Template'}
              </span>
              <div className="flex gap-1.5">
                <span className="p-1.5 bg-white/90 rounded-lg text-gray-700"><Eye className="w-4 h-4" /></span>
                <span className="p-1.5 bg-white/90 rounded-lg text-gray-700"><Download className="w-4 h-4" /></span>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 capitalize">
              {displayName}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
              {template.description || `Professional ${template.category?.toLowerCase() || 'HTML'} template with modern design and clean code.`}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{template.view_count || 0}</span>
              <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{template.download_count || 0}</span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  
  const pageSize = 16;

  const fetchTemplates = useCallback(async (reset = false) => {
    const currentPage = reset ? 0 : page;
    if (reset) setLoading(true);
    else if (!hasMore) return;
    
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(currentPage * pageSize),
      });
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);
      
      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();
      
      if (reset) {
        setTemplates(data.templates || []);
        setPage(0);
      } else {
        setTemplates(prev => [...prev, ...(data.templates || [])]);
      }
      setTotal(data.total || 0);
      setHasMore((data.templates || []).length === pageSize);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category, page, hasMore, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTemplates(true), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search, category]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el || loading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasMore, loadingMore]);

  useEffect(() => {
    if (page > 0) fetchTemplates(false);
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">H</span>
              </div>
              <span className="font-black text-lg tracking-tight hidden sm:block">TemplateHub</span>
            </Link>
            
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-medium text-gray-400 hidden md:block">{total} templates</span>
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setViewMode('masonry')} className={`p-1.5 rounded-md transition-all ${viewMode === 'masonry' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><Grid3X3 className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && templates.length === 0 ? (
          <div className={viewMode === 'masonry' ? 'masonry-grid' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No templates found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            {(search || category !== 'All') && (
              <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className={viewMode === 'masonry' ? 'masonry-grid' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}>
                {templates.map((template, i) => (
                  <TemplateCard key={template.id} template={template} index={i} />
                ))}
              </div>
            </AnimatePresence>
            
            <div ref={observerRef} className="h-10 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading more...
                </div>
              )}
            </div>
            
            {!loadingMore && hasMore && (
              <div className="flex justify-center mt-8">
                <button onClick={() => { setLoadingMore(true); setPage(p => p + 1); }} className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                  Load More Templates
                </button>
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button disabled={page === 0} onClick={() => { setPage(0); setTemplates([]); fetchTemplates(true); }} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                    <button key={i} onClick={() => { setPage(i); setTemplates([]); }} className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${Math.floor(page / 7) === 0 && i === page ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button disabled={(page + 1) >= totalPages} onClick={() => { setPage(totalPages - 1); setTemplates([]); }} className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} TemplateHub — {total} Premium HTML Templates</p>
        </div>
      </footer>
    </div>
  );
}
