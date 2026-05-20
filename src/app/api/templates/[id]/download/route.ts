import { NextResponse } from 'next/server';
import fs from 'fs';
import { getTemplatesDir, getTempDir, resolvePath } from '../../../../../lib/paths';
import { execSync } from 'child_process';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const templatesDir = getTemplatesDir();
    
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({ error: 'Templates directory not found' }, { status: 404 });
    }

    const folders = fs.readdirSync(templatesDir).filter(f => {
      try {
        return fs.statSync(resolvePath(templatesDir, f)).isDirectory();
      } catch { return false; }
    });
    
    let targetFolder: string | null = null;
    const idx = parseInt(id);
    if (!isNaN(idx) && idx >= 0 && idx < folders.length) {
      targetFolder = folders[idx];
    } else {
      targetFolder = folders.find(f => f === id || f.includes(String(id))) || null;
    }
    
    if (!targetFolder) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const sourcePath = resolvePath(templatesDir, targetFolder);
    const tempDir = getTempDir();
    const zipPath = resolvePath(tempDir, `${targetFolder}.zip`);
    
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    let zipBuffer: Buffer;
    
    try {
      execSync(`cd "${sourcePath}" && zip -r "${zipPath}" . -x '*.DS_Store' '*.git*' 2>/dev/null`, { stdio: 'pipe', timeout: 30000 });
      zipBuffer = fs.readFileSync(zipPath);
      setTimeout(() => { try { fs.unlinkSync(zipPath); } catch {} }, 10000);
    } catch {
      return NextResponse.json({ 
        error: 'Could not create zip', 
        message: `Download the template folder directly`,
        folder: targetFolder,
        direct_link: `/templates/${targetFolder}`
      }, { status: 500 });
    }
    
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${targetFolder}.zip"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}