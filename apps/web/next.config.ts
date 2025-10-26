import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // 开发模式优化
  reactStrictMode: true,
  
  // Turbopack 配置（Next.js 16 默认使用）
  experimental: {
    // 移除 fontLoaders，它已经被废弃
  },

  output: 'standalone',
};

export default nextConfig;