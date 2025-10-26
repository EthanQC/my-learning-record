import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  // 添加 fallback，如果 Google Fonts 加载失败会使用系统字体
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  // 设置较短的超时时间
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "我的学习记录",
  description: "技术博客与学习笔记",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}