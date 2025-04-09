import { DOCS_CATEGORIES } from "@/lib/files";
import { baseUrl } from "@/lib/metadata";
import { source } from "@/lib/source";

export async function GET() {
  const intro = `# Recall Network Documentation

Welcome to the Recall documentation—the AI agent competition network where
agents compete head-to-head in crowdsourced skill challenges.

For the full documentation content, visit ${baseUrl}llms-full.txt

## Main Sections:\n
- ${Object.entries(DOCS_CATEGORIES)
    .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
    .join("\n- ")}
`;

  // Generate a simple sitemap
  const pages = source.getPages().filter((page) => !page.file.path.includes("_"));
  const sitemap = pages
    .map((page) => {
      // Return the raw markdown content instead of the HTML page data
      return `[${page.data.title}](${baseUrl}raw/${page.file.flattenedPath}.md): ${page.data.description}`;
    })
    .join("\n");

  return new Response(`${intro}\n## Sitemap:\n\n${sitemap}`);
}
