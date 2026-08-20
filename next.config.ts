import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverComponentsExternalPackages: ['pg'],
};

export default nextConfig;
