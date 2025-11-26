import fs from "fs/promises";
import { generateFiles } from "fumadocs-openapi";
import matter from "gray-matter";
import path from "path";

import { generateMarkdownFromSpec } from "../lib/markdown-generator";

const SPEC_PATH = "specs/competitions.json";
const OUTPUT_PATH = "docs/reference/endpoints";
const MARKDOWN_OUTPUT_PATH = ".source/markdown/endpoints";

async function clearDirectory(dirPath: string): Promise<void> {
  try {
    const files = await fs.readdir(dirPath);

    // Delete each file in the directory except index.mdx
    const filesToDelete = files.filter((file) => file !== "index.mdx");

    await Promise.all(
      filesToDelete.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
          await fs.unlink(filePath);
          console.log(`Deleted: ${file}`);
        }
      })
    );

    const preservedFiles = files.length - filesToDelete.length;
    console.log(
      `Cleared ${filesToDelete.length} files from ${dirPath}${preservedFiles > 0 ? ` (preserved ${preservedFiles} index.mdx files)` : ""}`
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`Directory ${dirPath} does not exist, creating it...`);
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      console.error(`Error clearing directory ${dirPath}:`, error);
      throw error;
    }
  }
}

async function generateMarkdownFiles(
  specPath: string,
  mdxOutputPath: string,
  markdownOutputPath: string
): Promise<void> {
  // Read the OpenAPI spec
  const specContent = await fs.readFile(specPath, "utf8");
  const spec = JSON.parse(specContent);

  // Read all generated MDX files
  const mdxFiles = await fs.readdir(mdxOutputPath);

  let generatedCount = 0;

  for (const file of mdxFiles) {
    // Skip index.mdx and non-MDX files
    if (file === "index.mdx" || !file.endsWith(".mdx")) {
      continue;
    }

    const mdxFilePath = path.join(mdxOutputPath, file);
    const mdxContent = await fs.readFile(mdxFilePath, "utf8");

    // Parse frontmatter and content
    const { data, content } = matter(mdxContent);

    // Extract operations from the JSX content using regex
    const operationsMatch = content.match(/operations=\{(\[[\s\S]*?\])\}/);
    if (!operationsMatch || !operationsMatch[1]) {
      console.log(`Skipping ${file}: no operations found`);
      continue;
    }

    // Parse operations array safely (it's valid JavaScript array syntax)
    // This is safe because we're in the build script, not serving user requests
    let operations;
    try {
      operations = JSON.parse(
        operationsMatch[1]
          .replace(/'/g, '"') // Convert single quotes to double quotes
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote property names
      );
    } catch (e) {
      console.error(`Failed to parse operations in ${file}:`, e);
      continue;
    }

    // Generate markdown
    const markdown = generateMarkdownFromSpec(spec, operations);

    // Create full markdown with frontmatter
    const fullMarkdown = `# ${data.title}\n\n${data.description}\n\n${markdown}`;

    // Write markdown file
    const markdownFileName = file.replace(".mdx", ".md");
    const markdownFilePath = path.join(markdownOutputPath, markdownFileName);
    await fs.writeFile(markdownFilePath, fullMarkdown, "utf8");

    generatedCount++;
    console.log(`Generated: ${markdownFileName}`);
  }

  console.log(`Generated ${generatedCount} markdown files`);

  if (generatedCount === 0) {
    throw new Error("No markdown files generated - check OpenAPI spec and MDX generation");
  }
}

async function main(): Promise<void> {
  console.log("Clearing existing API reference files...");
  await clearDirectory(OUTPUT_PATH);

  console.log("Generating new API reference files...");
  await generateFiles({
    input: [SPEC_PATH],
    output: OUTPUT_PATH,
    per: "tag",
  });

  console.log("Clearing existing markdown files...");
  await clearDirectory(MARKDOWN_OUTPUT_PATH);

  console.log("Generating markdown files for LLMs...");
  await generateMarkdownFiles(SPEC_PATH, OUTPUT_PATH, MARKDOWN_OUTPUT_PATH);

  console.log("API reference generation completed!");
}

void main();
