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

  typescript: {
    ignoreBuildErrors: true,
  },

  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 压缩配置
  compress: true,

  // 缓存配置
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
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default nextConfig;