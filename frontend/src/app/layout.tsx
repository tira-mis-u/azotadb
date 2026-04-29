import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AzotaDB - Hệ thống luyện đề thi online",
  description: "Luyện đề thi trực tuyến thông minh, chấm bài tự động, phân tích điểm yếu. Dành cho giáo viên và học sinh.",
  keywords: "luyện đề, thi online, ôn thi, đề thi, học tập",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
