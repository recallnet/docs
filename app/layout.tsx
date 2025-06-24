import "./global.css";
import "katex/dist/katex.css";

import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { RootProvider } from "fumadocs-ui/provider";
import { MessageCircle } from "lucide-react";
import { ThemeProviderProps } from "next-themes";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { AISearchTrigger } from "@/components/ai";
import { DocsLayout, type DocsLayoutProps } from "@/components/theme/notebook";
import { buttonVariants } from "@/components/theme/ui/button";
import { createMetadata, defaultMetadata } from "@/lib/metadata";
import { source } from "@/lib/source";
import { cn } from "@/lib/theme/cn";

export const metadata = createMetadata({
  ...defaultMetadata,
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
});

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  sidebar: {
    collapsible: false,
    footer: (
      <div className="flex flex-col gap-2 p-2">
        <a
          href="https://flat-agustinia-3f3.notion.site/Recall-Media-Kit-H2-25-21cdfc9427de805fa9e0ee00f80e2567"
          className="text-fd-muted-foreground hover:text-fd-accent-foreground text-sm transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Media Kit
        </a>
      </div>
    ),
  },
};

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
              "bg-secondary/50 text-fd-secondary-foreground/80 fixed right-4 bottom-4 z-10 gap-2 rounded-xl shadow-lg backdrop-blur-lg md:right-6 md:bottom-8"
            )}
          >
            <MessageCircle className="size-4" />
            Ask AI
          </AISearchTrigger>
        </RootProvider>
      </body>
      <Analytics />
      {process.env.NODE_ENV !== "development" && process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
      )}
    </html>
  );
}
