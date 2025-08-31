const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://158.108.196.162:8000';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
