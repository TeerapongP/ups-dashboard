import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'; // 👈 ตั้งใน .env

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    // ยังเก็บไว้ได้ถ้าจำเป็นต้องใช้ที่อื่น
    NEXT_PUBLIC_API_URL_DEV: process.env.NEXT_PUBLIC_API_URL_DEV,
    NEXT_PUBLIC_API_URL_PROD: process.env.NEXT_PUBLIC_API_URL_PROD,
  },
  async rewrites() {
    return [
      // ✅ proxy ไป backend จริง (server-side rewrite)
      {
        source: '/backend/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },

      // อันนี้ของเดิม ถ้าต้องใช้
      {
        source: '/data/:path*',
        destination: '/data/:path*',
      },
    ];
  },
  images: {
    domains: [],
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
