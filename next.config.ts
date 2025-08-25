import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    domains: ['anime-gpt-assets.s3.amazonaws.com'],
    minimumCacheTTL: 60,
  },
  // Static assets configuration for production
  basePath: process.env.NODE_ENV === 'production' ? '/app' : '',
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://anime-gpt-assets.s3.amazonaws.com'
    : '',
  // Use SWC minification
  swcMinify: true,
  // Configure static asset optimization
  optimizeFonts: true,
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
