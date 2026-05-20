import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getHtmlRepos, getRepoContents } from '@/lib/github';

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    
    let query = supabase
      .from('html_templates_hub_templates')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Templates API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/templates - Sync templates from GitHub
export async function POST() {
  try {
    // Fetch HTML repos from GitHub
    const repos = await getHtmlRepos();
    
    const syncedTemplates = [];
    
    for (const repo of repos) {
      // Check if template already exists
      const { data: existing } = await supabase
        .from('html_templates_hub_templates')
        .select('id')
        .eq('repo_name', repo.name)
        .single();
      
      const templateData = {
        repo_name: repo.name,
        title: formatTitle(repo.name),
        description: repo.description || `A beautiful ${formatTitle(repo.name)} HTML template with modern design and responsive layout.`,
        category: categorizeTemplate(repo.name),
        repo_url: repo.html_url,
        github_owner: repo.full_name.split('/')[0],
        github_repo: repo.name,
        default_branch: repo.default_branch,
        file_count: repo.size,
        updated_at: new Date().toISOString(),
      };
      
      if (existing) {
        // Update existing
        const { data: updated } = await supabase
          .from('html_templates_hub_templates')
          .update(templateData)
          .eq('id', existing.id)
          .select()
          .single();
        syncedTemplates.push(updated);
      } else {
        // Insert new
        const { data: created } = await supabase
          .from('html_templates_hub_templates')
          .insert({ ...templateData, created_at: new Date().toISOString() })
          .select()
          .single();
        syncedTemplates.push(created);
      }
    }
    
    return NextResponse.json({ 
      message: `Synced ${syncedTemplates.length} templates from GitHub`,
      templates: syncedTemplates,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatTitle(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/\sHtml\s?/i, '')
    .trim();
}

function categorizeTemplate(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('landing') || lower.includes('portfolio')) return 'Landing Page';
  if (lower.includes('dashboard') || lower.includes('admin')) return 'Dashboard';
  if (lower.includes('ecommerce') || lower.includes('shop')) return 'E-Commerce';
  if (lower.includes('blog')) return 'Blog';
  if (lower.includes('portfolio')) return 'Portfolio';
  return 'General';
}
