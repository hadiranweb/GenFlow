const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile shared packages
  transpilePackages: ['@genflow/ui', '@genflow/db'],
  
  // Experimental features
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),

    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Images
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Output standalone for Docker
  output: 'standalone',
}

module.exports = nextConfig
