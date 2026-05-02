import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "QuizzOrz - Hệ thống thi trực tuyến thông minh",
  description: "Luyện đề thi trực tuyến thông minh, chấm bài tự động, phân tích điểm yếu. Dành cho giáo viên và học sinh.",
  keywords: "luyện đề, thi online, ôn thi, đề thi, học tập",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply theme before React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('quizzorz-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                  document.documentElement.classList.add(t === 'light' ? '' : t);
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
