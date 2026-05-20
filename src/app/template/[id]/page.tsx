'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Download, ExternalLink, ArrowLeft } from 'lucide-react';

export default function TemplateDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [neighbors, setNeighbors] = useState<any>({ prev: null, next: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/templates/${id}`);
        const data = await res.json();
        setTemplate(data.template);
        setNeighbors(data.neighbors);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );

  if (!template) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Template not found</h1>
      <Link href="/" className="text-sm font-bold underline">Go back home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="border-b border-gray-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Back to hub
          </Link>
          <div className="flex items-center gap-4">
             <button
              onClick={() => window.open(`/api/templates/${id}/download`, '_blank')}
              className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
             <button
              onClick={() => window.open(`/api/templates/${id}/preview`, '_blank')}
              className="px-6 py-2 border border-black rounded-lg text-sm font-bold hover:bg-black hover:text-white transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              {template.name.replace('-html', '').replace(/-/g, ' ')}
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
              {template.description || 'A professional, high-performance HTML template designed for modern web applications and websites.'}
            </p>
          </div>

          <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-2xl">
            <img
              src={template.screenshot_url || `https://placehold.co/1200x675/f9f9f9/000000?text=${template.name}`}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Next/Prev Navigation */}
        <div className="mt-24 border-t border-gray-100 pt-12 flex flex-col md:flex-row gap-12">
          {neighbors.prev && (
            <Link href={`/template/${neighbors.prev.id}`} className="flex-1 group">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Previous Template
                </span>
                <h4 className="text-2xl font-black uppercase tracking-tighter group-hover:underline">
                  {neighbors.prev.name.replace('-html', '').replace(/-/g, ' ')}
                </h4>
              </div>
            </Link>
          )}
          {neighbors.next && (
            <Link href={`/template/${neighbors.next.id}`} className="flex-1 group text-right">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-end gap-2">
                  Next Template
                  <ChevronRight className="w-4 h-4" />
                </span>
                <h4 className="text-2xl font-black uppercase tracking-tighter group-hover:underline">
                  {neighbors.next.name.replace('-html', '').replace(/-/g, ' ')}
                </h4>
              </div>
            </Link>
          )}
        </div>
      </main>

      <footer className="py-20 px-6 border-t border-gray-100 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
           <Link href="/" className="text-xl font-black tracking-tighter uppercase">
            HTML Hub
          </Link>
          <div className="flex gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-black">Twitter</a>
            <a href="#" className="hover:text-black">Github</a>
            <a href="#" className="hover:text-black">Dribbble</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
