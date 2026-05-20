'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Download, ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates?search=${search}&offset=${page * 12}&limit=12`);
      const data = await res.json();
      setTemplates(data.templates || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans">
      <header className="border-b border-gray-100 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase">
            HTML Hub
          </Link>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>

          <button 
            onClick={async () => {
              const res = await fetch('/api/sync');
              if (res.ok) alert('Sync started! Refresh in a few minutes.');
            }}
            className="px-4 py-2 border border-black rounded-lg text-sm font-bold hover:bg-black hover:text-white transition-all"
          >
            Sync Repos
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading && templates.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-video bg-gray-100 animate-pulse rounded-lg" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <AnimatePresence mode="popLayout">
                {templates.map((template: any) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <Link href={`/template/${template.id}`} className="block space-y-4">
                      <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative group-hover:border-black transition-colors">
                        <img
                          src={template.screenshot_url || `https://placehold.co/800x450/f9f9f9/000000?text=${template.name}`}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg uppercase tracking-tight">{template.name.replace('-html', '').replace(/-/g, ' ')}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mt-1">{template.description || 'Premium HTML template.'}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {total > 12 && (
              <div className="mt-20 flex items-center justify-center gap-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3 border border-gray-200 rounded-full hover:border-black disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold">
                  {page + 1} / {Math.ceil(total / 12)}
                </span>
                <button
                  disabled={(page + 1) * 12 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3 border border-gray-200 rounded-full hover:border-black disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-gray-100 py-12 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} HTML Templates Hub</p>
        </div>
      </footer>
    </div>
  );
}
