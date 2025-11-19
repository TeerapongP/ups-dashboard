const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
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
