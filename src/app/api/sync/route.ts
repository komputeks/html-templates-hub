import { NextResponse } from 'next/server';

export async function GET() {
  const GITHUB_TOKEN = process.env.GITHUB_PAT;
  const USERNAME = process.env.GITHUB_USERNAME || 'komputeks';

  try {
    // 1. Fetch all repositories
    const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=all`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch repos');
    const repos = await response.json();

    // 2. Filter repos ending with 'html'
    const htmlRepos = repos.filter((repo: any) => repo.name.toLowerCase().endsWith('html'));

    return NextResponse.json({ 
      count: htmlRepos.length,
      repos: htmlRepos.map((r: any) => ({
        name: r.name,
        description: r.description,
        clone_url: r.clone_url,
        id: r.id
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
