/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable, no longer experimental
  output: 'standalone',
  experimental: {
    // Optimize server components
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

module.exports = nextConfig 