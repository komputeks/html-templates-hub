import supabase from '../../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: any, { params }: any) {
  const { id } = params;

  try {
    const { data: template, error } = await supabase
      .from('html_templates_hub_templates')
      .select('name, repo_url')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Redirect to GitHub zip download
    return NextResponse.redirect(`${template.repo_url}/archive/refs/heads/main.zip`);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
