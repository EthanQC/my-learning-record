import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    fontLoaders: [
      {
        loader: '@next/font/google',
        options: {
          // 使用国内镜像
          googleFontsUrl: 'https://fonts.font.im',
        },
      },
    ],
  },
};

export default nextConfig;
