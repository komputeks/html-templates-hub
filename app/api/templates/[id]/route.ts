import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/templates/[id] - Get single template
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
    
    // Get adjacent templates for navigation
    const { data: allTemplates } = await supabase
      .from('html_templates_hub_templates')
      .select('id, title')
      .order('created_at', { ascending: false });
    
    const currentIndex = allTemplates?.findIndex((t) => t.id === id) ?? -1;
    
    return NextResponse.json({
      ...template,
      prevTemplate: currentIndex > 0 ? allTemplates?.[currentIndex - 1] : null,
      nextTemplate: currentIndex < (allTemplates?.length ?? 0) - 1 ? allTemplates?.[currentIndex + 1] : null,
    });
  } catch (error: any) {
    console.error('Template detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
