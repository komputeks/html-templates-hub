import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/templates/[id]/download - Get download URL (redirects to GitHub zip)
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
    
    // Redirect to GitHub archive download
    const zipUrl = `https://api.github.com/repos/${template.github_owner}/${template.github_repo}/zipball`;
    
    return NextResponse.redirect(zipUrl);
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
