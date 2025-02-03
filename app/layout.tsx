import "./global.css";
import "katex/dist/katex.css";

import { ThemeToggle } from "fumadocs-ui/components/layout/theme-toggle";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/notebook";
import { RootProvider } from "fumadocs-ui/provider";
import { Metadata } from "next";
import { ThemeProviderProps } from "next-themes";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { baseUrl, createMetadata } from "@/lib/metadata";
import { source } from "@/lib/source";

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: {
    collapsible: false,
    footer: <ThemeToggle mode="light-dark" className="w-fit" />,
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
      <body className="flex min-h-screen flex-col">
        <RootProvider theme={theme}>
          <DocsLayout {...docsOptions}>{children}</DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
