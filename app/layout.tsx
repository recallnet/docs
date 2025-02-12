import "./global.css";
import "katex/dist/katex.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import { RootProvider } from "fumadocs-ui/provider";
import { MessageCircle } from "lucide-react";
import { Metadata } from "next";
import { ThemeProviderProps } from "next-themes";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { AISearchTrigger } from "@/components/ai";
import { DocsLayout, type DocsLayoutProps } from "@/components/theme/notebook";
import { buttonVariants } from "@/components/theme/ui/button";
import { baseUrl, createMetadata } from "@/lib/metadata";
import { source } from "@/lib/source";
import { cn } from "@/lib/theme/cn";

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: {
    collapsible: false,
  },
};

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
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider theme={theme}>
          <DocsLayout {...docsOptions}>{children}</DocsLayout>
          <AISearchTrigger
            className={cn(
              buttonVariants({
                color: "secondary",
              }),
              "bg-secondary/50 text-fd-secondary-foreground/80 fixed right-4 bottom-4 z-10 gap-2 rounded-xl shadow-lg backdrop-blur-lg md:right-8 md:bottom-8"
            )}
          >
            <MessageCircle className="size-4" />
            Ask AI
          </AISearchTrigger>
        </RootProvider>
      </body>
      {process.env.NODE_ENV !== "development" && process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
      )}
    </html>
  );
}
