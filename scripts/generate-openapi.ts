import fs from "fs/promises";
import { generateFiles } from "fumadocs-openapi";
import path from "path";

const SPEC_PATH = "specs/competitions.json";
const OUTPUT_PATH = "docs/api-reference/endpoints";

async function clearDirectory(dirPath: string): Promise<void> {
  try {
    const files = await fs.readdir(dirPath);

    // Delete each file in the directory
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
          await fs.unlink(filePath);
          console.log(`Deleted: ${file}`);
        }
      })
    );

    console.log(`Cleared ${files.length} files from ${dirPath}`);
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
