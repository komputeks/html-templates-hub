// GitHub API helper for fetching template repositories
const GITHUB_TOKEN = process.env.GITHUB_PAT!;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'komputeks';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  size: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  size: number;
}

export async function getHtmlRepos(): Promise<GitHubRepo[]> {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
    cache: 'no-store',
  });
  
  if (!res.ok) throw new Error('Failed to fetch repos');
  
  const repos: GitHubRepo[] = await res.json();
  return repos.filter((r) => r.name.toLowerCase().includes('html'));
}

export async function getRepoContents(owner: string, repo: string, path = ''): Promise<GitHubFile[]> {
  const url = path
    ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    : `https://api.github.com/repos/${owner}/${repo}/contents`;
  
  const res = await fetch(url, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
    cache: 'no-store',
  });
  
  if (!res.ok) throw new Error(`Failed to fetch contents: ${url}`);
  
  return res.json();
}

export async function getFileContent(downloadUrl: string): Promise<string> {
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` },
    cache: 'no-store',
  });
  
  if (!res.ok) throw new Error('Failed to fetch file content');
  return res.text();
}

export async function getRepoZipUrl(owner: string, repo: string): Promise<string> {
  return `https://api.github.com/repos/${owner}/${repo}/zipball`;
}

export { type GitHubFile, type GitHubRepo };
