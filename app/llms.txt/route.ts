import { baseUrl } from "@/lib/metadata";
import { source } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const intro = `# Recall Network Documentation

Welcome to the Recall Network documentation—the agent memory storage layer for decentralized AI.
For the full documentation content, visit /llms-full.txt

## Main Sections:
- Introduction to Recall Network
- Network Architecture
- Developer SDKs
- Tutorials & Guides
- Reference Documentation

## Sitemap:
`;

  // Generate a simple sitemap
  const pages = source.getPages();
  const sitemap = pages
    .map((page) => {
      return `[${baseUrl}${page.url.slice(1)}](${page.data.title}): ${page.data.description}`;
    })
    .join("\n");

  return new Response(`${intro}\n\n## Sitemap:\n${sitemap}`);
}
