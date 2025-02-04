import type { TableOfContents } from "fumadocs-core/server";
import "fumadocs-core/source";
import type { MDXContent } from "mdx/types";

declare module "fumadocs-core/source" {
  interface PageData {
    title: string;
    // The properties below are needed to resolve compiler errors
    description?: string;
    body: MDXContent;
    toc?: TableOfContents;
    full?: boolean;
  }
}
