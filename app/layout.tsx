import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ちくわ育成日記",
  description: "ポメプーのちくわを育てよう！",
  manifest: "/pokemon/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#833AB4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ちくわ育成" />
        <link rel="apple-touch-icon" href="/pokemon/icon.svg" />
        <link rel="manifest" href="/pokemon/manifest.json" />
      </head>
      <body className="min-h-full bg-[#FAFAFA]">{children}</body>
    </html>
  );
}
