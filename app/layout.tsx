import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "My Playful Blog",
  description: "A playful personal website built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
