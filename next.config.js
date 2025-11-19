/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  webpack: (config) => {
    // Prevent canvas module from being bundled (PDF.js optional dependency)
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
  // Generate a custom 404.html during build for proper CloudFront/S3 error handling
  exportPathMap: async function (defaultPathMap) {
    return {
      ...defaultPathMap,
      '/404': { page: '/404' },
    };
  },
}

module.exports = nextConfig
