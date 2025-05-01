/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true,
  },
  // This is important for Netlify deployment
  output: 'standalone',
  // Ensure compatibility with Netlify's environment
  experimental: {
    serverComponentsExternalPackages: ['@netlify/plugin-nextjs'],
  },
}

module.exports = nextConfig
