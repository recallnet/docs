import { OpenAI } from "openai";

import { baseUrl } from "./metadata";

export const REJECTION_MESSAGE =
  "Hmm, I'm not sure if that's relevant to Recall. Try asking a different question?";

export const SYSTEM_PROMPT = `
You are a helpful assistant with expert knowledge of the Recall Network and its documentation.
You are given a question and a list of relevant documentation chunks.
Your job is to answer the question using the provided documentation.
You MUST be concise but provide a brief helpful answer. Only answer questions about Recall and its documentation.
If you don't know the answer, just say "${REJECTION_MESSAGE}".
Do NOT make up an answer about Recall-specifics, or make assumptions on what Recall code might look like.
Only reference code that is provided in the documentation, any remove instances of \`// [!code highlight]\` if applicable.
Do NOT list the source files in the answer; these are already provided in the **Source(s)** section by logic external to the system.
You MUST make sure to format as markdown, code blocks, and add language/title to it, like this:

## Example

\`\`\`typescript
const x = 1;
\`\`\`

`;

export type Document = {
  file: string;
  category: string;
  title: string;
  description: string;
  keywords?: string;
  content: string;
};

export type DocEmbedding = {
  embedding: number[];
  metadata: Pick<Document, "file" | "title" | "description" | "category" | "keywords">;
  content: string;
};

export type RelevantChunk = Omit<DocEmbedding, "embedding"> & {
  score: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
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

export function isValidQuery(query: string): boolean {
  // Basic sanity checks
  if (!query?.trim()) return false;

  // Check for nonsense patterns
  const repeatedChars = /(.)\1{4,}/; // 5+ repeated characters
  const specialCharsOnly = /^[^a-zA-Z0-9]+$/; // Only special characters
  const tooShort = query.length < 3;

  return !(repeatedChars.test(query) || specialCharsOnly.test(query) || tooShort);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * (b?.[i] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi ** 2, 0));
  return dotProduct / (normA * normB);
}

export function keywordMatch(query: string, keywords?: string): number {
  if (!keywords) return 0;
  const queryWords = query.toLowerCase().match(/\b\w+\b/g) ?? [];
  const docKeywords = keywords.toLowerCase().match(/\b\w+\b/g) ?? [];
  const stem = (word: string) => word.replace(/(ing|ed|s)$/, "");

  const matches = queryWords.filter((word) =>
    docKeywords.some((keyword) => stem(keyword).includes(stem(word)))
  ).length;

  return matches / queryWords.length;
}

export function calculateCombinedScore(
  embeddingScore: number,
  keywordScore: number,
  hasKeywords: boolean
): number {
  const MIN_EMBEDDING_SIMILARITY = 0.6; // Ensure the embedding score is not too low
  const MAX_EMBEDDING_SIMILARITY = 0.95; // Upper bound for normalization

  if (embeddingScore < MIN_EMBEDDING_SIMILARITY) {
    return 0;
  }
  const normalizedEmbedding =
    (embeddingScore - MIN_EMBEDDING_SIMILARITY) /
    (MAX_EMBEDDING_SIMILARITY - MIN_EMBEDDING_SIMILARITY);

  const cappedEmbedding = Math.min(normalizedEmbedding, 1); // Cap normalized score at 1
  // If no keywords exist, use only embedding score; else, boost the score
  if (!hasKeywords) {
    return cappedEmbedding;
  }
  return Math.min(1, cappedEmbedding + keywordScore * 0.3);
}

export async function getRelevantChunks(
  openai: OpenAI,
  query: string,
  docs: DocEmbedding[]
): Promise<RelevantChunk[]> {
  const embeddingResponse = await withRetry(() =>
    openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: [query],
    })
  );

  if (!embeddingResponse.data[0]?.embedding) throw new Error("Failed to get embedding response");
  const queryEmbedding = embeddingResponse.data[0].embedding;

  const scores = docs.map((doc) => {
    const embeddingScore = cosineSimilarity(queryEmbedding, doc.embedding);
    const hasKeywords = !!doc.metadata.keywords?.trim();
    const keywordScore = keywordMatch(query, doc.metadata.keywords);

    const combinedScore = calculateCombinedScore(embeddingScore, keywordScore, hasKeywords);

    return {
      content: doc.content,
      metadata: {
        file: doc.metadata.file,
        title: doc.metadata.title,
        description: doc.metadata.description,
        category: doc.metadata.category,
        keywords: doc.metadata.keywords,
      },
      score: combinedScore,
      debug: {
        embeddingScore,
        keywordScore,
        combinedScore,
        hasKeywords,
        keywords: doc.metadata.keywords,
      },
    };
  });

  const relevantScores = scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // If no relevant matches, return empty array
  if (relevantScores.length === 0) {
    console.log("No relevant matches found for query:", query);
    return [];
  }

  // Log for debugging
  console.log("Query:", query);
  console.log(
    "Top 3 matches:",
    relevantScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(
        (s) => `
Score: ${s.debug.combinedScore.toFixed(4)}
Title: ${s.metadata.title}
Keywords: ${s.metadata.keywords}
Embedding Score: ${s.debug.embeddingScore.toFixed(4)}
Keyword Score: ${s.debug.keywordScore.toFixed(4)}
`
      )
  );

  return relevantScores;
}

export function addSourceLinks(content: string, relevantChunks: RelevantChunk[]): string {
  if (content.includes(REJECTION_MESSAGE)) return content;
  if (content.includes("**Source(s)**:")) {
    return content;
  }

  // Only include sources that are within 0.10 of the top score
  const topScore = Math.max(...relevantChunks.map((chunk) => chunk.score));
  const closeMatches = relevantChunks.filter((chunk) => chunk.score >= topScore - 0.1);
  const sources = new Map<string, { file: string; title: string }>();
  for (const chunk of closeMatches) {
    const file = chunk.metadata.file;
    if (!sources.has(file)) {
      sources.set(file, {
        file,
        title: chunk.metadata.title,
      });
    }
  }
  if (sources.size === 0) return content;
  content +=
    "**Source(s)**: " +
    Array.from(sources.values())
      .map(({ file, title }) => `[${title}](${baseUrl}${file})`)
      .join(", ");

  return content;
}
