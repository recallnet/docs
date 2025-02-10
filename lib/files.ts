import fg from "fast-glob";
import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

import { type DocsFile } from "@/lib/ai";

// Note: these map to the folder names in the `docs` directory
export const DOCS_CATEGORIES = {
  agents: "Building AI agents with data storage, retrieval, and plugins",
  intro:
    "Getting Started with Recall, including quickstarts, faucet and portal guides, and basic concepts",
  protocol: "System architecture, contracts, RPCs, and protocol design",
  sources: "Data source creation for pure object storage and data pipelines",
  tools: "Developer tools, including SDKs, CLIs, and the S3 adapter",
  root: "Recall Network",
};

export type CategoryType = keyof typeof DOCS_CATEGORIES;

export function getCategoryDisplayName(filePath: string): string {
  const pathParts = filePath.split(path.sep);
  const mainCategory = pathParts[0];
  if (mainCategory && mainCategory in DOCS_CATEGORIES)
    return DOCS_CATEGORIES[mainCategory as CategoryType];

  return DOCS_CATEGORIES.root;
}

export async function getDocsContent(docsDir: string): Promise<DocsFile[]> {
  const files = await fg(["**/*.mdx"], {
    cwd: docsDir,
    ignore: ["**/openapi/**"],
    absolute: true,
    dot: false,
  });

  const scanned = await Promise.all(
    files.map(async (file) => {
      const fileContent = await fs.readFile(file);
      const { content, data } = matter(fileContent.toString());
      const relativePath = path.relative(docsDir, file);
      const category = getCategoryDisplayName(relativePath);
      const processed = await processContent(content);

      // Make sure `index` is removed from the filename and strip the suffix—creating the slug
      const filename = relativePath.replace(/\.mdx$/, "").replace(/\/index$/, "");
      return {
        file: filename,
        category,
        title: data.title || filename,
        description: data.description || "",
        keywords: data.keywords || "",
        content: processed,
      };
    })
  );

  return scanned;
}

async function processContent(content: string): Promise<string> {
  const file = await remark().use(remarkMdx).use(remarkGfm).use(remarkStringify).process(content);

  return String(file);
}
