// import fg from "fast-glob";
// import matter from "gray-matter";
// import * as fs from "node:fs/promises";
// import path from "node:path";
// import { OpenAI } from "openai";
// import { remark } from "remark";
// import remarkGfm from "remark-gfm";
// import remarkMdx from "remark-mdx";
// import remarkStringify from "remark-stringify";

// export const revalidate = false;

// const categories = {
//   root: "Recall network",
//   apps: "Applications to explore or build with Recall",
//   architecture: "Recall network architecture",
//   ceramic: "Ceramic network event streams",
//   cli: "Recall network cli",
//   databases: "Database indexing and querying",
//   intro: "Introduction to Recall network",
//   network: "Recall network overview",
//   operators: "Running a Recall node",
//   reference: "Reference documentation",
//   "rust-sdk": "Rust SDK",
//   s3: "S3-compatible object storage",
//   tutorials: "Tutorials about building with Recall",
// };

// type CategoryType = keyof typeof categories;

// export type RAGDocument = {
//   file: string;
//   category: string;
//   title: string;
//   description: string;
//   content: string;
// };

// export async function fetchDocsContent(): Promise<RAGDocument[]> {
//   const files = await fg(["./docs/**/*.mdx", "!./docs/openapi/**/*"]);

//   const scan = files.map(async (file) => {
//     const fileContent = await fs.readFile(file);
//     const { content, data } = matter(fileContent.toString());
//     const dir = path.dirname(file).split(path.sep).at(2) || "root";
//     const category = dir in categories ? categories[dir as CategoryType] : categories.root;

//     if (data._mdx?.mirror) {
//       return;
//     }

//     // Format the content in
//     const processed = await processContent(content);
//     return {
//       file,
//       category,
//       title: data.title,
//       description: data.description,
//       content: processed,
//     };
//   });

//   const scanned = await Promise.all(scan);

//   return scanned.filter((doc) => doc !== undefined) as RAGDocument[];
// }

// async function processContent(content: string): Promise<string> {
//   const file = await remark().use(remarkMdx).use(remarkGfm).use(remarkStringify).process(content);

//   return String(file);
// }

// function splitIntoChunks(text: string, maxChunkSize: number = 4000): string[] {
//   const chunks: string[] = [];
//   let currentChunk = "";

//   // Split by paragraphs/sections to maintain context
//   const sections = text.split(/\n\n+/);

//   for (const section of sections) {
//     // If adding this section would exceed chunk size, start a new chunk
//     if ((currentChunk + section).length > maxChunkSize && currentChunk) {
//       chunks.push(currentChunk.trim());
//       currentChunk = "";
//     }
//     currentChunk += (currentChunk ? "\n\n" : "") + section;
//   }

//   // Add the last chunk if it's not empty
//   if (currentChunk) {
//     chunks.push(currentChunk.trim());
//   }

//   return chunks;
// }

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// async function generateEmbeddings() {
//   // Read your docs
//   const docs = await fetchDocsContent();

//   // Split into chunks if needed
//   const chunks = docs.flatMap((doc) =>
//     doc.content.length > 4000 ? splitIntoChunks(doc.content) : [doc]
//   );

//   // Generate embeddings in batches to respect rate limits
//   const embeddingsData = [];
//   const batchSize = 100;

//   for (let i = 0; i < chunks.length; i += batchSize) {
//     const batch = chunks.slice(i, i + batchSize);

//     const embeddingResponse = await openai.embeddings.create({
//       model: "text-embedding-ada-002",
//       input: batch.map((text) => text.trim()).filter((text) => text.length > 0),
//     });

//     const batchEmbeddings = embeddingResponse.data.map((emb, idx) => ({
//       content: batch[idx],
//       embedding: emb.embedding,
//     }));

//     embeddingsData.push(...batchEmbeddings);

//     // Optional: add delay between batches
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//   }

//   // Save to file
//   await fs.writeFile(
//     path.join(process.cwd(), "public", "embeddings.json"),
//     JSON.stringify(embeddingsData)
//   );
// }

// generateEmbeddings().catch(console.error);
