import fg from "fast-glob";
import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

import { type DocsFile } from "@/lib/ai";
import { isApiReferencePage } from "@/lib/api-reference";

// Note: these map to the folder names in the `docs` directory
export const DOCS_CATEGORIES = {
  reference: "API Reference Documentation",
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
    ignore: ["**/_*.mdx"],
    absolute: true,
    dot: false,
  });

  const scanned = await Promise.all(
    files.map(async (file) => {
      const relativePath = path.relative(docsDir, file).split(path.sep).join("/");
      const category = getCategoryDisplayName(relativePath);

      const isApiPage = isApiReferencePage(relativePath);

      let title: string;
      let description: string;
      let keywords: string;
      let processed: string;

      if (isApiPage) {
        // For API pages, read pre-generated markdown
        const markdownFileName = path.basename(file).replace(".mdx", ".md");
        const markdownPath = path.join(docsDir, "..", ".source", "markdown", "endpoints", markdownFileName);
        const markdownContent = await fs.readFile(markdownPath, "utf8");
        const lines = markdownContent.split('\n');
        title = lines[0]?.replace('# ', '') || relativePath;  // First line is title
        description = lines[2] || "";  // Third line is description
        keywords = "";
        processed = markdownContent;
      } else {
        // For regular pages, use the existing method
        const fileContent = await fs.readFile(file);
        const { content, data } = matter(fileContent.toString());
        title = data.title || relativePath;
        description = data.description || "";
        keywords = data.keywords || "";
        processed = await processContent(content);
      }

      // Make sure `index` is removed from the filename and strip the suffix—creating the slug
      const filename = relativePath.replace(/\.mdx$/, "").replace(/\/index$/, "");
      return {
        file: filename,
        category,
        title,
        description,
        keywords,
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
