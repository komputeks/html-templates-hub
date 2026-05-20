import supabase from '../../../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: any, { params }: any) {
  const { id } = params;

  try {
    const { data: template, error } = await supabase
      .from('html_templates_hub_templates')
      .select('folder_path')
      .eq('id', id)
      .single();

    if (error) throw error;

    // This should ideally serve the index.html from the folder
    // For now, we redirect to the static path
    return NextResponse.redirect(new URL(`/templates/${template.folder_path}/index.html`, req.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
