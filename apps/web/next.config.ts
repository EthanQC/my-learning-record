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

  // 缓存配置。/_next/static/*（含 next/font 字体分片）的 Cache-Control 由 Next standalone
  // server 内置下发（public, max-age=31536000, immutable），不受此处 headers() 控制；
  // Caddy 侧也已移除重复下发（F6/F6-补充，见 deploy/Caddyfile.example）
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