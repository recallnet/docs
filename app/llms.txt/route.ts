import { DOCS_CATEGORIES } from "@/lib/files";
import { baseUrl } from "@/lib/metadata";
import { source } from "@/lib/source";

export async function GET() {
  const intro = `# Recall Network Documentation

Welcome to the Recall Network documentation—the agent memory storage layer for decentralized AI.
For the full documentation content, visit ${baseUrl}llms-full.txt

## Main Sections:\n
- ${Object.entries(DOCS_CATEGORIES)
    .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
    .join("\n- ")}
`;

  // Generate a simple sitemap
  const pages = source.getPages();
  const sitemap = pages
    .map((page) => {
      return `[${baseUrl}${page.url.slice(1)}](${page.data.title}): ${page.data.description}`;
    })
    .join("\n");

  return new Response(`${intro}\n## Sitemap:\n\n${sitemap}`);
}
