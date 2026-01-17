import type { Metadata } from "next";
import "../styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamic = 'force-dynamic';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qingverse.com";
export const metadata: Metadata = {
  title: "Qingverse - 技术学习与成长记录",
  description: "记录技术成长的个人博客",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Qingverse - 技术学习与成长记录",
    description: "记录技术成长的博客与笔记",
    url: siteUrl,
    siteName: "Qingverse",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qingverse - 技术学习与成长记录",
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
      <body className="font-sans antialiased flex flex-col min-h-screen bg-gradient-to-br from-pink-50/30 via-white to-pink-50/20">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
