import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getFileContent, getRepoContents } from '@/lib/github';

// GET /api/templates/[id]/preview - Get HTML content for preview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: template, error } = await supabase
      .from('html_templates_hub_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    // Get the index.html or main file content
    const files = await getRepoContents(template.github_owner, template.github_repo);
    const indexFile = files.find((f) => f.name === 'index.html');
    
    if (!indexFile?.download_url) {
      return NextResponse.json({ error: 'No index.html found' }, { status: 404 });
    }
    
    const htmlContent = await getFileContent(indexFile.download_url);
    
    // Return the HTML content
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
