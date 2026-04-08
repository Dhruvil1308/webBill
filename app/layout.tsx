'use client';

import { SessionProvider } from "next-auth/react";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased text-webbill-dark bg-webbill-cream">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
