import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      sidebar={{
        collapsible: false,
        // footer: <div className="h-2 border-none"></div>, // In case you want to add a footer
      }}
    >
      {children}
    </DocsLayout>
  );
}
