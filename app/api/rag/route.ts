import fg from "fast-glob";
import matter from "gray-matter";
import * as fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

export const revalidate = false;

const categories = {
  root: "Recall Network Overview",
  advanced: "Advanced Topics, including SDKs, CLIs, S3 adapters, etc.",
  agents: "Recall AI Agents data storage, retrieval, and plugins",
  architecture: "System Architecture and protocol design",
  intro:
    "Getting Started with Recall, including quickstarts, faucet and portal guides, and basic concepts",
  network: "Network APIs for low-level EVM, objects, and CometBFT consensus",
  operators: "Node Operators guides for running a Recall node or developing locally",
  sources: "Data Source creation for pure object storage and data pipelines",
};

function getCategoryDisplayName(filePath: string): string {
  const pathParts = filePath.split(path.sep);
  const mainCategory = pathParts[0];
  if (mainCategory && mainCategory in categories) return categories[mainCategory as CategoryType];

  return categories.root;
}

type CategoryType = keyof typeof categories;

export type RAGDocument = {
  file: string;
  category: string;
  title: string;
  description: string;
  keywords?: string;
  content: string;
};

export async function GET(): Promise<Response> {
  const docsDir = path.join(process.cwd(), "docs");
  const files = await fg(["**/*.mdx"], {
    cwd: docsDir,
    ignore: ["**/openapi/**"],
    absolute: true,
    dot: false,
  });

  const scan = files.map(async (file) => {
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
  });

  const scanned = await Promise.all(scan);

  return new Response(JSON.stringify(scanned));
}

async function processContent(content: string): Promise<string> {
  const file = await remark().use(remarkMdx).use(remarkGfm).use(remarkStringify).process(content);

  return String(file);
}
