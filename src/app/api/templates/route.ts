import { NextResponse } from 'next/server';
import supabase from '../../../lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const limit = parseInt(searchParams.get('limit') || '16');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let query = supabase
      .from('html_templates_hub_templates')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ 
      templates: data || [], 
      total: count || 0 
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
