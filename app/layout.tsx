import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import { ThemeProviderProps } from "next-themes";
import type { ReactNode } from "react";
import { createMetadata, baseUrl } from "@/lib/metadata";
import { Metadata } from "next";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/notebook";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import "katex/dist/katex.css";

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: {
    collapsible: false,
  },
};

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

const theme: ThemeProviderProps = {
  themes: ["light", "dark"],
  defaultTheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={theme}>
          <DocsLayout {...docsOptions}>{children}</DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
