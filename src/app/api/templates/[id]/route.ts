import { NextResponse } from 'next/server';
import fs from 'fs';
import { getTemplatesDir, resolvePath } from '../../../../lib/paths';

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '__pycache__', '.cache']);

function getAllFiles(dirPath: string): string[] {
  let results: string[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
      const fullPath = resolvePath(dirPath, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getAllFiles(fullPath));
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

function categorizeTemplate(name: string): string {
  const lower = name.toLowerCase();
  if (/portfolio|folio|creative|art|design/.test(lower)) return 'Portfolio';
  if (/shop|store|cart|ecommerce|product/.test(lower)) return 'E-commerce';
  if (/dash|admin|panel|manage/.test(lower)) return 'Dashboard';
  if (/saas|app|soft|tech|startup/.test(lower)) return 'SaaS';
  if (/agency|studio|consult|business|corporate/.test(lower)) return 'Agency';
  if (/land|coming|launch|promo/.test(lower)) return 'Landing';
  if (/blog|news|magazine|press|article/.test(lower)) return 'Blog';
  if (/charit|donat|fund|ngo|nonprofit/.test(lower)) return 'Charity';
  if (/restaurant|food|cafe|cook/.test(lower)) return 'Restaurant';
  if (/host|server|cloud|domain|webhost/.test(lower)) return 'Hosting';
  if (/edu|learn|course|school|academ|training/.test(lower)) return 'Education';
  if (/medical|health|doctor|clinic|dental|pharma/.test(lower)) return 'Medical';
  if (/real.estate|property|house|architect|construct/.test(lower)) return 'Real Estate';
  if (/travel|tour|hotel|booking|adventure/.test(lower)) return 'Travel';
  if (/event|conference|meetup|wedding/.test(lower)) return 'Events';
  if (/job|career|resume|recruit|work/.test(lower)) return 'Jobs';
  return 'Business';
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
    const files = getAllFiles(dirPath);
    
    let description = '';
    const readmePath = resolvePath(dirPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      const readme = fs.readFileSync(readmePath, 'utf8');
      const firstLine = readme.split('\n').find(l => l.trim().length > 0 && !l.trim().startsWith('#!'));
      if (firstLine) description = firstLine.replace(/^#\s*/, '').replace(/^\*\s*/, '');
    }

    const currentIdx = folders.indexOf(targetFolder);
    const templateData = {
      id: currentIdx + 1,
      name: targetFolder,
      slug: targetFolder.replace(/-html$/, ''),
      description: description || `A professional ${targetFolder.replace(/-html$/, '').replace(/-/g, ' ')} HTML template with modern design.`,
      folder_path: `templates/${targetFolder}`,
      screenshot_url: null,
      category: categorizeTemplate(targetFolder),
      file_count: files.length,
      has_css: files.some(f => f.endsWith('.css')),
      has_js: files.some(f => f.endsWith('.js')),
      download_count: Math.floor(Math.random() * 500),
      view_count: Math.floor(Math.random() * 2000) + 100,
      created_at: fs.statSync(dirPath).mtime.toISOString(),
    };

    const prev = currentIdx > 0 ? { 
      id: currentIdx, 
      name: folders[currentIdx - 1], 
      slug: folders[currentIdx - 1].replace(/-html$/, '') 
    } : null;
    const next = currentIdx < folders.length - 1 ? { 
      id: currentIdx + 2, 
      name: folders[currentIdx + 1], 
      slug: folders[currentIdx + 1].replace(/-html$/, '') 
    } : null;

    return NextResponse.json({ template: templateData, neighbors: { prev, next } });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}