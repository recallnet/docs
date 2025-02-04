import "./global.css";
import "katex/dist/katex.css";

import { RootProvider } from "fumadocs-ui/provider";
import { Metadata } from "next";
import { ThemeProviderProps } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { DocsLayout, type DocsLayoutProps } from "@/components/theme/notebook";
import { baseUrl, createMetadata } from "@/lib/metadata";
import { source } from "@/lib/source";

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: {
    collapsible: false,
  },
};

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = createMetadata({
  title: {
    template: "%s | Recall Docs",
    default: "Recall Docs",
  },
  description: "Recall documentation for intelligent agent memory",
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
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider theme={theme}>
          <DocsLayout {...docsOptions}>{children}</DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
