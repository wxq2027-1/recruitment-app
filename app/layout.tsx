import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "青年科创中心 · 2026 招新",
  description: "青年科创中心六大部门招新报名入口",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
