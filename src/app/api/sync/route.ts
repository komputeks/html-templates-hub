import { NextResponse } from 'next/server';
import fs from 'fs';
import { getTemplatesDir, resolvePath } from '../../../lib/paths';

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

export async function GET() {
  try {
    const templatesDir = getTemplatesDir();
    
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({ error: 'Templates directory not found' }, { status: 404 });
    }

    const folders = fs.readdirSync(templatesDir)
      .filter(f => {
        try {
          return fs.statSync(resolvePath(templatesDir, f)).isDirectory();
        } catch { return false; }
      });
    
    const templates = folders.map(folderName => {
      const dirPath = resolvePath(templatesDir, folderName);
      const files = getAllFiles(dirPath);
      
      let description = '';
      const readmePath = resolvePath(dirPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        const readme = fs.readFileSync(readmePath, 'utf8');
        const firstLine = readme.split('\n').find(l => l.trim().length > 0 && !l.trim().startsWith('#!'));
        if (firstLine) description = firstLine.replace(/^#\s*/, '').replace(/^\*\s*/, '');
      }
      
      return {
        name: folderName,
        slug: folderName.replace(/-html$/, ''),
        description: description || `Professional ${folderName.replace(/-html$/, '').replace(/-/g, ' ')} HTML template.`,
        folder_path: `templates/${folderName}`,
        category: categorizeTemplate(folderName),
        file_count: files.length,
        has_css: files.some(f => f.endsWith('.css')),
        has_js: files.some(f => f.endsWith('.js')),
      };
    });

    return NextResponse.json({
      total: templates.length,
      templates,
      message: `Found ${templates.length} templates`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}