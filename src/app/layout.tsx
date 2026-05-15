import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "안전보건 공지 현황판 | 씨젠의료재단",
  description:
    "안전보건공단 · 산업안전보건연구원 · 산업안전포털 · 고용노동부 최신 공지를 실시간으로 확인합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0b1120] text-gray-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
