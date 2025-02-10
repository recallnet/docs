import "dotenv/config";
import * as fs from "node:fs/promises";
import path from "node:path";
import { OpenAI } from "openai";

import { type DocsEmbedding, type DocsFile } from "@/lib/ai";
import { getDocsContent } from "@/lib/files";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Missing OpenAI API key");

const openai = new OpenAI({ apiKey });

const MODEL = "text-embedding-ada-002";

const DOCS_DIR = path.join(process.cwd(), "docs");
const EMBEDDINGS_DIR = path.join(process.cwd(), "public", "static");
const EMBEDDINGS_FILE = path.join(EMBEDDINGS_DIR, "embeddings.json");

// Ensure content doesn't hit the ada-002 limit of 8192 tokens
function splitIntoChunks(doc: DocsFile, maxTokens: number = 6000): DocsFile[] {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  if (doc.content.length <= maxChars) {
    return [doc];
  }

  // Split at major section boundaries, or split into chunks as needed
  const sections = doc.content.split(/(?=^#{1,3}\s)/m);
  const chunks: DocsFile[] = [];
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
  await fs.mkdir(EMBEDDINGS_DIR, { recursive: true });
  const docs = await getDocsContent(DOCS_DIR);
  const chunks = docs.flatMap((doc) => splitIntoChunks(doc));

  const embeddings: DocsEmbedding[] = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await openai.embeddings.create({
        model: MODEL,
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

  await fs.writeFile(EMBEDDINGS_FILE, JSON.stringify(embeddings));
}

generateEmbeddings().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
