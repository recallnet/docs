import fg from "fast-glob";
import matter from "gray-matter";
import * as fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

const categories = {
  root: "Recall network",
  apps: "Applications to explore or build with Recall",
  architecture: "Recall network architecture",
  ceramic: "Ceramic network event streams",
  cli: "Recall network cli",
  databases: "Database indexing and querying",
  intro: "Introduction to Recall network",
  network: "Recall network overview",
  operators: "Running a Recall node",
  reference: "Reference documentation",
  "rust-sdk": "Rust SDK",
  s3: "S3-compatible object storage",
  tutorials: "Tutorials about building with Recall",
};

type CategoryType = keyof typeof categories;

export async function GET() {
  const files = await fg(["./docs/**/*.mdx", "!./docs/openapi/**/*"]);

  const scan = files.map(async (file) => {
    const fileContent = await fs.readFile(file);
    const { content, data } = matter(fileContent.toString());
    const dir = path.dirname(file).split(path.sep).at(2) || "root";
    const category = dir in categories ? categories[dir as CategoryType] : categories.root;

    if (data._mdx?.mirror) {
      return;
    }

    // Format the content in
    const processed = await processContent(content);
    return `file: ${file}
# ${category}: ${data.title}

${data.description}
        
${processed}`;
  });

  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"));
}

async function processContent(content: string): Promise<string> {
  const file = await remark().use(remarkMdx).use(remarkGfm).use(remarkStringify).process(content);

  return String(file);
}
