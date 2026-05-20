import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getHtmlRepos, getRepoContents } from '@/lib/github';

// POST /api/sync - Full sync of templates from GitHub
export async function POST() {
  try {
    const repos = await getHtmlRepos();
    
    const results = [];
    
    for (const repo of repos) {
      try {
        // Get repository structure
        const files = await getRepoContents(repo.full_name.split('/')[0], repo.name);
        const htmlFiles = files.filter((f) => f.type === 'file' && f.name.endsWith('.html'));
        const hasAssets = files.some((f) => f.type === 'dir' && ['css', 'js', 'images', 'img', 'fonts', 'assets'].includes(f.name));
        
        const templateData = {
          repo_name: repo.name,
          title: repo.name
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase())
            .replace(/\sHtml\s?/i, '')
            .trim(),
          description: repo.description || `A comprehensive HTML template featuring ${htmlFiles.length} HTML pages${hasAssets ? ' with included CSS, JavaScript, and image assets' : ''}. Perfect for modern web projects requiring a professional look and feel.`,
          category: categorizeTemplate(repo.name),
          repo_url: repo.html_url,
          github_owner: repo.full_name.split('/')[0],
          github_repo: repo.name,
          default_branch: repo.default_branch,
          file_count: htmlFiles.length,
          total_size: repo.size,
          html_files: htmlFiles.map((f) => f.name),
          has_css: files.some((f) => f.type === 'dir' && f.name === 'css'),
          has_js: files.some((f) => f.type === 'dir' && f.name === 'js'),
          has_images: files.some((f) => f.type === 'dir' && ['images', 'img'].includes(f.name)),
          updated_at: new Date().toISOString(),
        };
        
        // Upsert
        const { data: existing } = await supabase
          .from('html_templates_hub_templates')
          .select('id')
          .eq('repo_name', repo.name)
          .single();
        
        if (existing) {
          const { data: updated } = await supabase
            .from('html_templates_hub_templates')
            .update(templateData)
            .eq('id', existing.id)
            .select()
            .single();
          results.push({ action: 'updated', template: updated });
        } else {
          const { data: created } = await supabase
            .from('html_templates_hub_templates')
            .insert({ ...templateData, created_at: new Date().toISOString() })
            .select()
            .single();
          results.push({ action: 'created', template: created });
        }
      } catch (err: any) {
        results.push({ action: 'error', repo: repo.name, error: err.message });
      }
    }
    
    return NextResponse.json({
      message: `Sync completed: ${results.length} repositories processed`,
      results,
    });
  } catch (error: any) {
    console.error('Full sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function categorizeTemplate(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('landing') || lower.includes('hero')) return 'Landing Page';
  if (lower.includes('dashboard') || lower.includes('admin') || lower.includes('panel')) return 'Dashboard';
  if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store')) return 'E-Commerce';
  if (lower.includes('blog')) return 'Blog';
  if (lower.includes('portfolio')) return 'Portfolio';
  if (lower.includes('fixer') || lower.includes('repair') || lower.includes('service')) return 'Service/Business';
  return 'General';
}
