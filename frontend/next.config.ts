import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@note-taking/backend'],
  experimental: {
    externalDir: true,
  },
  // Avoid devtools chunk corruption seen with some editor extensions + Turbopack
  devIndicators: false,
};

export default nextConfig;
