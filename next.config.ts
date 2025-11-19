const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://158.108.196.162:8000/api';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  async rewrites() {
    // ถ้าไม่มี BACKEND_URL ให้ skip rewrites
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
  // เพิ่ม timeout สำหรับ server
  serverRuntimeConfig: {
    timeout: 60000, // 60 วินาที
  },
  // เพิ่ม experimental features สำหรับ proxy timeout
  experimental: {
    proxyTimeout: 60000, // 60 วินาที
  },
};

export default nextConfig;
