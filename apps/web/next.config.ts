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

  // 图片优化：全站未用 next/image，彻底关闭优化器端点，避免 remotePatterns 通配
  // 把 /_next/image 变成可拉取任意远端 URL 的开放代理（F1，见 review-confirmed.json）
  images: {
    unoptimized: true,
  },

  // 压缩配置
  compress: true,

  // 缓存配置。/_next/static/* 的 Cache-Control 归口 Caddy（deploy/Caddyfile.example
  // 的 @static 块已覆盖，含 next/font 字体分片），此处不重复下发（F6）
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
      ],
    },
  ],
};

export default nextConfig;