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
// We **don't** want to include the `advanced` or `api-reference` folders
export const DOCS_CATEGORIES = {
  competitions: "Competitions guides and usage",
  quickstart: "Quickstart guides for building agents with Recall",
  root: "Introduction to the Recall Network",
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
    ignore: ["api-reference/**", "**/_*.mdx", "advanced/**"],
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

export async function getRawDocContent(file: string): Promise<{
  title: string;
  description: string;
  content: string;
}> {
  const fileExists = await fs
    .access(file)
    .then(() => true)
    .catch(() => false);
  if (!fileExists) {
    throw new Error("File not found");
  }
  const fileContent = await fs.readFile(file);
  const { data, content } = matter(fileContent.toString());
  const processed = await processContent(content);
  return {
    title: data.title || file,
    description: data.description || "",
    content: processed,
  };
}

async function processContent(content: string): Promise<string> {
  const file = await remark().use(remarkMdx).use(remarkGfm).use(remarkStringify).process(content);

  return String(file);
}
