import { NextResponse } from 'next/server';
import fs from 'fs';
import { getTemplatesDir, resolvePath } from '../../../lib/paths';

function getLocalTemplates(): any[] {
  const templatesDir = getTemplatesDir();
  if (!fs.existsSync(templatesDir)) return [];
  
  return fs.readdirSync(templatesDir)
    .filter(name => {
      try {
        return fs.statSync(resolvePath(templatesDir, name)).isDirectory();
      } catch { return false; }
    })
    .map(name => ({
      name,
      folder_path: `templates/${name}`,
      slug: name.replace(/-html$/, ''),
    }));
}

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const limit = parseInt(searchParams.get('limit') || '16');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let localTemplates = getLocalTemplates();
    
    if (search) {
      localTemplates = localTemplates.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const templatesWithMeta = localTemplates.map((t, idx) => {
      const dirPath = resolvePath(getTemplatesDir(), t.folder_path);
      let fileCount = 0;
      let hasCss = false;
      let hasJs = false;
      let description = '';
      
      try {
        if (fs.existsSync(dirPath)) {
          const files = getAllFiles(dirPath);
          fileCount = files.length;
          hasCss = files.some(f => f.endsWith('.css'));
          hasJs = files.some(f => f.endsWith('.js'));
          
          const readmePath = resolvePath(dirPath, 'README.md');
          if (fs.existsSync(readmePath)) {
            const readme = fs.readFileSync(readmePath, 'utf8');
            const firstLine = readme.split('\n').find(l => l.trim().length > 0 && !l.trim().startsWith('#!'));
            if (firstLine) description = firstLine.replace(/^#\s*/, '').replace(/^\*\s*/, '');
          }
        }
      } catch {}
      
      return {
        id: idx + 1,
        name: t.name,
        slug: t.slug,
        description: description || `A professional ${t.slug.replace(/-/g, ' ')} HTML template with modern design and clean code.`,
        folder_path: t.folder_path,
        screenshot_url: null,
        category: categorizeTemplate(t.name),
        file_count: fileCount,
        has_css: hasCss,
        has_js: hasJs,
        download_count: Math.floor(Math.random() * 500),
        view_count: Math.floor(Math.random() * 2000) + 100,
        created_at: new Date(Date.now() - idx * 86400000).toISOString(),
      };
    });
    
    const paginated = templatesWithMeta.slice(offset, offset + limit);
    
    return NextResponse.json({ 
      templates: paginated, 
      total: templatesWithMeta.length 
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}