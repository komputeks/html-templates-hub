// Runtime-only path resolver - avoids Turbopack tracing large directories
// All paths are constructed at runtime from environment variables

export function getTemplatesDir(): string {
  return `${process.cwd()}/public/templates`;
}

export function getTempDir(): string {
  return `${process.cwd()}/temp`;
}

export function resolvePath(...parts: string[]): string {
  return parts.join('/');
}
