import fs from "fs/promises";
import { generateFiles } from "fumadocs-openapi";
import path from "path";

const SPEC_PATH = "specs/competitions.json";
const OUTPUT_PATH = "docs/api-reference/endpoints";

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

async function main(): Promise<void> {
  console.log("Clearing existing API reference files...");
  await clearDirectory(OUTPUT_PATH);

  console.log("Generating new API reference files...");
  await generateFiles({
    input: [SPEC_PATH],
    output: OUTPUT_PATH,
    per: "tag",
  });

  console.log("API reference generation completed!");
}

void main();
