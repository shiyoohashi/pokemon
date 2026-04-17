import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "愛犬との相性診断",
  description: "あなたと愛犬の相性を診断しよう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-amber-50">{children}</body>
    </html>
  );
}
