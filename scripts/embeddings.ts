import fg from "fast-glob";
import matter from "gray-matter";
import * as fs from "node:fs/promises";
import path from "node:path";
import { OpenAI } from "openai";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkStringify from "remark-stringify";

import type { DocEmbedding, Document } from "@/components/ai/engines/openai";

type CategoryType = keyof typeof categories;

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

export async function getDocsContent(): Promise<Document[]> {
  const docsDir = path.join(process.cwd(), "docs");
  const files = await fg(["**/*.mdx"], {
    cwd: docsDir,
    ignore: ["**/openapi/**"],
    absolute: true,
    dot: false,
  });

  const scanned = await Promise.all(
    files.map(async (file) => {
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
    })
  );

  return scanned;
}

async function processContent(content: string): Promise<string> {
  const file = await remark().use(remarkMdx).use(remarkGfm).use(remarkStringify).process(content);

  return String(file);
}

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) throw new Error("Missing OpenAI API key");

const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  console.log("withRetry");
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if it's a rate limit error
      if (error?.status === 429) {
        const retryAfter =
          error.response?.headers?.["retry-after"] ||
          error.message.match(/try again in (\d+\.?\d*)s/)?.[1];

        // Calculate delay: either from header, message, or exponential backoff
        const delay = retryAfter
          ? parseFloat(retryAfter) * 1000
          : Math.min(baseDelay * Math.pow(2, attempt), 30000);

        console.log(`Rate limited. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}

// Ensure content doesn't hit the ada-002 limit of 8192 tokens
function splitIntoChunks(doc: Document, maxTokens: number = 6000): Document[] {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;

  if (doc.content.length <= maxChars) {
    return [doc];
  }

  // Split at major section boundaries first
  const sections = doc.content.split(/(?=^#{1,3}\s)/m);

  // If sections are still too large, split them further
  const chunks: Document[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const section of sections) {
    if ((currentChunk + section).length > maxChars && currentChunk) {
      chunks.push({
        ...doc,
        content: currentChunk.trim(),
        title: `${doc.title} (Part ${chunkIndex + 1})`,
        file: `${doc.file}#section-${chunkIndex + 1}`,
      });
      currentChunk = "";
      chunkIndex++;
    }
    currentChunk += (currentChunk ? "\n\n" : "") + section;
  }

  // Add the last chunk
  if (currentChunk) {
    chunks.push({
      ...doc,
      content: currentChunk.trim(),
      title: `${doc.title} (Part ${chunkIndex + 1})`,
      file: `${doc.file}#section-${chunkIndex + 1}`,
    });
  }
  return chunks;
}

async function generateEmbeddings() {
  // Read your docs
  const docs = await getDocsContent();
  const chunks = docs.flatMap((doc) => splitIntoChunks(doc));

  const embeddings: DocEmbedding[] = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk.content.trim(),
      });

      return {
        embedding: embedding.data[0]?.embedding ?? [],
        metadata: {
          file: chunk.file,
          title: chunk.title,
          description: chunk.description,
          category: chunk.category,
          keywords: chunk.keywords,
        },
        content: chunk.content,
      };
    })
  );

  // Save to file
  await fs.writeFile(
    path.join(process.cwd(), "public", "embeddings.json"),
    JSON.stringify(embeddings)
  );
}

generateEmbeddings().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
