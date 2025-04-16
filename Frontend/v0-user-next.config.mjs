/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output static HTML files for better compatibility
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Disable strict mode for development
  reactStrictMode: false,
}

export default nextConfig;
