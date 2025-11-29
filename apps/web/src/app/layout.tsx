import type { Metadata } from "next";
import "../styles/globals.css";
import { Footer } from "@/components/layout/Footer";

export const dynamic = 'force-dynamic';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qingverse.com";
export const metadata: Metadata = {
  title: "我的学习记录",
  description: "技术博客与学习笔记",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "我的学习记录 - Qingverse",
    description: "记录技术成长的博客与笔记，涵盖 Go、C++、前端与算法",
    url: siteUrl,
    siteName: "Qingverse",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "我的学习记录 - Qingverse",
    description: "记录技术成长的博客与笔记",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
