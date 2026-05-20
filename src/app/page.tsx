'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, ExternalLink, ChevronLeft, ChevronRight, Loader2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

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

  const handleDownload = async (template: any) => {
    // This would typically involve a server-side route to zip the folder
    // For now, we'll simulate it by opening the repo URL if available
    if (template.repo_url) {
      window.open(`${template.repo_url}/archive/refs/heads/main.zip`, '_blank');
    } else {
      alert('Download functionality is being processed. Please check back later.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">HTML Hub</h1>
          </div>

          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search 148+ premium templates..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 transition-all text-lg"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-95">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Stats/Filter Bar */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Explore Templates</h2>
            <p className="text-gray-500 text-lg">Showing {templates.length} of {total} available templates</p>
          </div>
          <div className="flex gap-2">
            {['All', 'Landing', 'Portfolio', 'Admin', 'E-commerce'].map((tag) => (
              <button key={tag} className="px-5 py-2 rounded-full border border-gray-200 hover:border-black transition-colors text-sm font-medium">
                {tag}
              </button>
            ))}
          </div>
        </div>

        {loading && templates.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse rounded-3xl" />
                <div className="h-6 bg-gray-200 animate-pulse rounded-lg w-3/4" />
                <div className="h-4 bg-gray-200 animate-pulse rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {templates.map((template: any, idx: number) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                      <img
                        src={template.screenshot_url || `https://api.screenshotmachine.com/?key=YOUR_KEY&url=https://komputeks.github.io/${template.name}&dimension=1024x768`}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = `https://placehold.co/800x600/f3f4f6/111827?text=${template.name}`; }}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6">
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="w-full py-3 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Live Preview
                        </button>
                        <button
                          onClick={() => handleDownload(template)}
                          className="w-full py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75"
                        >
                          <Download className="w-5 h-5" />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 px-2">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-xl group-hover:text-black transition-colors">{template.name.replace('-html', '').replace(/-/g, ' ')}</h3>
                      </div>
                      <p className="text-gray-500 mt-1 line-clamp-2 text-sm leading-relaxed">
                        {template.description || 'A high-quality responsive HTML template built with modern web standards and best practices.'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="mt-20 flex items-center justify-center gap-8">
                <button
                  disabled={page === 0}
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-100 hover:border-black disabled:opacity-30 disabled:hover:border-gray-100 transition-all font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <div className="flex items-center gap-3">
                  {[...Array(Math.ceil(total / 12))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${page === i ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, page - 2), Math.min(Math.ceil(total / 12), page + 3))}
                </div>
                <button
                  disabled={(page + 1) * 12 >= total}
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-100 hover:border-black disabled:opacity-30 disabled:hover:border-gray-100 transition-all font-bold"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modern Preview Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          >
            <div className="h-20 px-8 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
                <div>
                  <h2 className="text-white font-bold text-xl">{selectedTemplate.name}</h2>
                  <p className="text-gray-400 text-sm">Previewing template</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDownload(selectedTemplate)}
                  className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Template
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe
                src={`/templates/${selectedTemplate.folder_path}/index.html`}
                className="w-full h-full border-none"
                title={selectedTemplate.name}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-32 py-20 border-t border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">HTML Templates Hub</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-12 text-lg">
            A curated collection of professional HTML templates for developers and designers.
          </p>
          <div className="flex justify-center gap-8 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-black transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
