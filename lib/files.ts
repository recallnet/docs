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

  const specPath = path.join(docsDir, "..", "specs", "competitions.json");

  const scanned = await Promise.all(
    files.map(async (file) => {
      const relativePath = path.relative(docsDir, file);
      const category = getCategoryDisplayName(relativePath);

      // Check if this is an API reference page (not the index page)
      const isApiReferencePage = relativePath.includes("reference/endpoints/") &&
                                  !relativePath.endsWith("endpoints/index.mdx");

      let title: string;
      let description: string;
      let keywords: string;
      let processed: string;

      if (isApiReferencePage) {
        // For API pages, use getApiDocContent to generate markdown from OpenAPI spec
        const apiContent = await getApiDocContent(file, specPath);
        title = apiContent.title;
        description = apiContent.description;
        keywords = "";
        processed = apiContent.content;
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

interface Operation {
  path: string;
  method: string;
}

export async function getApiDocContent(
  file: string,
  specPath: string
): Promise<{
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

  // Extract operations from the JSX content
  const operationsMatch = content.match(/operations=\{(\[[\s\S]*?\])\}/);
  if (!operationsMatch || !operationsMatch[1]) {
    // Fall back to regular content if no operations found
    return getRawDocContent(file);
  }

  let operations: Operation[];
  try {
    // Parse the operations array (it's in JSON-like format)
    const parsed = eval(operationsMatch[1]);
    if (!Array.isArray(parsed)) {
      return getRawDocContent(file);
    }
    operations = parsed as Operation[];
  } catch {
    // Fall back if parsing fails
    return getRawDocContent(file);
  }

  // Read the OpenAPI spec
  const specFile = await fs.readFile(specPath, "utf8");
  const spec = JSON.parse(specFile);

  // Generate markdown content from the spec
  let markdown = "";

  operations.forEach(({ path: opPath, method }) => {
    const op = spec.paths?.[opPath]?.[method];
    if (!op) return;

    markdown += `## ${method.toUpperCase()} ${opPath}\n\n`;

    if (op.summary) {
      markdown += `**${op.summary}**\n\n`;
    }

    if (op.description) {
      markdown += `${op.description}\n\n`;
    }

    // Parameters
    if (op.parameters?.length) {
      markdown += "**Parameters:**\n\n";
      op.parameters.forEach((param: { name: string; in: string; description?: string; required?: boolean; schema?: { type: string } }) => {
        const required = param.required ? " (required)" : "";
        const type = param.schema?.type ? `: ${param.schema.type}` : "";
        markdown += `- \`${param.name}\` (${param.in}${type})${required}: ${param.description || ""}\n`;
      });
      markdown += "\n";
    }

    // Request body
    if (op.requestBody?.content?.["application/json"]?.schema) {
      markdown += "**Request Body:**\n\n";
      markdown += `\`\`\`json\n${JSON.stringify(op.requestBody.content["application/json"].schema, null, 2)}\n\`\`\`\n\n`;
    }

    // Response
    const responses = op.responses || {};
    const successResponse = responses["200"] || responses["201"] || responses["204"];
    if (successResponse) {
      markdown += "**Success Response:**\n\n";
      if (successResponse.description) {
        markdown += `${successResponse.description}\n\n`;
      }
      if (successResponse.content?.["application/json"]?.schema) {
        markdown += `\`\`\`json\n${JSON.stringify(successResponse.content["application/json"].schema, null, 2)}\n\`\`\`\n\n`;
      }
    }

    markdown += "---\n\n";
  });

  return {
    title: data.title || file,
    description: data.description || "",
    content: markdown.trim(),
  };
}
