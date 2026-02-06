/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for smaller Docker images
  output: 'standalone',
  // Set the workspace root to silence the warning
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
