import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  images: {
    domains: ['anime-gpt-assets.s3.amazonaws.com'],
    minimumCacheTTL: 60,
  },
  // AWS S3 configuration for static assets
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://anime-gpt-assets.s3.amazonaws.com'
    : undefined,
};

export default nextConfig;
