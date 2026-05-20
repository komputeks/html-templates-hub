/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
  // Use webpack for now to avoid turbopack tracing issues with large static dirs
  // turbopack: {},  // Keep default (webpack) for stability
};

module.exports = nextConfig;
