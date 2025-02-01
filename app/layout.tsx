import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { createMetadata, baseUrl } from "@/lib/metadata";
import { Metadata } from "next";
import "katex/dist/katex.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = createMetadata({
  title: {
    template: "%s | Recall Docs",
    default: "Recall Docs",
  },
  description: "Recall documentation for agent memory builders",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  metadataBase: baseUrl,
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
