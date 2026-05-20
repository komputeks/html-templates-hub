import { NextResponse } from 'next/server';
import fs from 'fs';
import { getTemplatesDir, resolvePath } from '../../../../../lib/paths';

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '__pycache__', '.cache']);

function findHtmlFile(dir: string): string | null {
  if (!fs.existsSync(dir)) return null;
  try {
    const entries = fs.readdirSync(dir);
    
    if (entries.includes('index.html')) {
      return resolvePath(dir, 'index.html');
    }
    
    const htmlFile = entries.find(f => f.endsWith('.html') && !f.startsWith('.'));
    if (htmlFile) return resolvePath(dir, htmlFile);
    
    for (const entry of entries) {
      const fullPath = resolvePath(dir, entry);
      try {
        if (fs.statSync(fullPath).isDirectory() && !SKIP_DIRS.has(entry)) {
          const found = findHtmlFile(fullPath);
          if (found) return found;
        }
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

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

    const dirPath = resolvePath(templatesDir, targetFolder);
    const htmlFilePath = findHtmlFile(dirPath);
    
    const displayName = targetFolder.replace(/-html$/, '').replace(/-/g, ' ');
    
    if (!htmlFilePath) {
      const noPreviewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview: ${displayName}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;color:#64748b}
  .wrap{text-align:center;padding:3rem;max-width:500px}
  .icon{font-size:4rem;margin-bottom:1rem}
  h1{color:#1e293b;font-size:1.5rem;margin-bottom:.75rem}
  p{line-height:1.6;font-size:1rem}
  a{display:inline-block;margin-top:1.5rem;padding:.75rem 2rem;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:600}
  a:hover{background:#1d4ed8}
</style>
</head>
<body>
<div class="wrap">
  <div class="icon">📁</div>
  <h1>${displayName}</h1>
  <p>No HTML preview available for this template. Download the full package to view it locally.</p>
  <a href="/api/templates/${id}/download">⬇️ Download Template</a>
</div>
</body></html>`;
      
      return new NextResponse(noPreviewHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    const basePath = `/templates/${targetFolder}`;
    
    if (!htmlContent.includes('<base ')) {
      htmlContent = htmlContent.replace('<head>', `<head><base href="${basePath}/">`);
    }
    
    const toolbar = `
<div style="position:fixed;top:0;left:0;right:0;z-index:999999;background:#0f172a;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f1f5f9;box-shadow:0 2px 12px rgba(0,0,0,.25);font-size:13px">
  <div style="display:flex;align-items:center;gap:10px">
    <strong style="color:#fff;font-size:14px">📄 ${displayName}</strong>
    <span style="color:#64748b">Live Preview</span>
  </div>
  <div style="display:flex;gap:6px">
    <a href="/api/templates/${id}/download" style="background:#3b82f6;color:#fff;padding:5px 14px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px">⬇️ Download</a>
    <a href="/template/${id}/${targetFolder.replace(/-html$/,'')}" style="background:#334155;color:#fff;padding:5px 14px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">← Back</a>
    <button onclick="this.parentElement.parentElement.remove();document.querySelector('.preview-spacer')?.remove()" style="background:#ef4444;color:#fff;padding:5px 10px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:600">✕</button>
  </div>
</div>
<div class="preview-spacer" style="height:44px"></div>`;
    
    htmlContent = htmlContent.replace('<body>', `<body>${toolbar}`);
    
    return new NextResponse(htmlContent, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error: any) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}