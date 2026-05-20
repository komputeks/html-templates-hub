import { NextResponse } from 'next/server';
import supabase from '../../../../lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: template, error } = await supabase
      .from('html_templates_hub_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Fetch neighbors
    const { data: prev } = await supabase
      .from('html_templates_hub_templates')
      .select('id, name, slug')
      .lt('id', template.id)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    const { data: next } = await supabase
      .from('html_templates_hub_templates')
      .select('id, name, slug')
      .gt('id', template.id)
      .order('id', { ascending: true })
      .limit(1)
      .single();

    return NextResponse.json({ 
      template, 
      neighbors: { 
        prev: prev || null, 
        next: next || null 
      } 
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
