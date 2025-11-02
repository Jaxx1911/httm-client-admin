/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Backend API server
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8000/auth/:path*', // Backend auth server
      },
      {
        source: '/model',
        destination: 'http://localhost:8000/model',
      },
      {
        source: '/model/:path*',
        destination: 'http://localhost:8000/model/:path*',
      },
      {
        source: '/models/:path*',
        destination: 'http://localhost:8000/models/:path*',
      },
    ]
  },
};

export default nextConfig;
