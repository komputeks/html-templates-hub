import supabase from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let query = supabase
      .from('html_templates_hub_templates')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return NextResponse.json({ templates: data, total: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: any) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('html_templates_hub_templates')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
