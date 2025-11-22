/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Ensure assets are loaded from root
  assetPrefix: process.env.ASSET_PREFIX || undefined,
  webpack: (config) => {
    // Prevent canvas module from being bundled (PDF.js optional dependency)
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
}

module.exports = nextConfig
