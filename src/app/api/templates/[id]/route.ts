import supabase from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: any, { params }: any) {
  const { id } = params;

  try {
    const { data: template, error } = await supabase
      .from('html_templates_hub_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch neighbors
    const { data: prev } = await supabase
      .from('html_templates_hub_templates')
      .select('id, name')
      .lt('created_at', template.created_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: next } = await supabase
      .from('html_templates_hub_templates')
      .select('id, name')
      .gt('created_at', template.created_at)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    return NextResponse.json({ template, neighbors: { prev, next } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
