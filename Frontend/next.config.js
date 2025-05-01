/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true,
  },
  // Output standalone build for better deployment compatibility
  output: 'standalone',
  // External packages configuration for Next.js 15+
  serverExternalPackages: [],
}

module.exports = nextConfig
