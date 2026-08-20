import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 明确指定 pg 在服务端单独加载
  serverExternalPackages: ['pg'],
  // 可选：增大内存限制
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

export default nextConfig;
