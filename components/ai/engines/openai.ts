import { OpenAI } from "openai";

import type { Engine, MessageRecord } from "@/components/ai/context";
import { baseUrl } from "@/lib/metadata";

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

type RelevantChunk = Omit<DocEmbedding, "embedding"> & {
  score: number;
};

const apiKey = process.env.OPENAI_API_KEY ?? "";

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

async function fetchDocsContext(): Promise<DocEmbedding[]> {
  const response = await fetch("/api/rag");
  if (!response.ok) throw new Error("Failed to fetch docs context");
  return (await response.json()) as DocEmbedding[];
}

function addSourceLinks(content: string, relevantChunks: RelevantChunk[]): string {
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
  content += "\n\n**Source(s)**:\n";
  content += Array.from(sources.values())
    .map(({ file, title }) => `[${title}](${baseUrl}${file})`)
    .join(", ");

  return content;
}

function keywordMatch(query: string, keywords?: string): number {
  if (!keywords) return 0;
  const queryWords = query.toLowerCase().match(/\b\w+\b/g) ?? [];
  const docKeywords = keywords.toLowerCase().match(/\b\w+\b/g) ?? [];
  const stem = (word: string) => word.replace(/(ing|ed|s)$/, "");

  const matches = queryWords.filter((word) =>
    docKeywords.some((keyword) => stem(keyword).includes(stem(word)))
  ).length;

  return matches / queryWords.length;
}

function calculateCombinedScore(
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

function isValidQuery(query: string): boolean {
  // Basic sanity checks
  if (!query?.trim()) return false;

  // Check for nonsense patterns
  const repeatedChars = /(.)\1{4,}/; // 5+ repeated characters
  const specialCharsOnly = /^[^a-zA-Z0-9]+$/; // Only special characters
  const tooShort = query.length < 3;

  return !(repeatedChars.test(query) || specialCharsOnly.test(query) || tooShort);
}

async function getRelevantChunks(
  query: string | undefined,
  docs: DocEmbedding[]
): Promise<RelevantChunk[]> {
  if (!query || !isValidQuery(query)) {
    console.log("Query rejected as invalid:", query);
    return [];
  }

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

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * (b?.[i] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi ** 2, 0));
  return dotProduct / (normA * normB);
}

const REJECTION_MESSAGE =
  "Hmm, I'm not sure if that's relevant to Recall. Try asking a different question?";

const SYSTEM_PROMPT = `
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

export async function createOpenAIEngine(): Promise<Engine> {
  let messages: MessageRecord[] = [];
  let docsContext = await fetchDocsContext();
  let aborted = false;

  async function generateNew(onUpdate?: (full: string) => void, onEnd?: (full: string) => void) {
    aborted = false;
    const message: MessageRecord = {
      role: "assistant",
      content: "",
    };

    messages.push(message);
    console.log("messages", messages);
    const relevant = await getRelevantChunks(
      messages.filter((msg) => msg.role === "user").at(-1)?.content,
      docsContext
    );
    console.log("relevant", relevant);
    if (relevant.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 150)); // Brief "wait" to mimic awaiting response
      let content = "";
      const streamText = async function* streamText(text: string, delay: number = 5) {
        for (const char of text) {
          yield char;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      };

      // Simulate streaming for rejection message
      for await (const char of streamText(REJECTION_MESSAGE)) {
        if (aborted) break;
        content += char;
        message.content = content;
        onUpdate?.(content);
      }
      onEnd?.(content);
      return;
    }
    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "system",
            content: `Here are the most relevant documentation sections:\n\n${relevant
              .map(
                (chunk) =>
                  `Source: ${chunk.metadata.file}\nCategory: ${chunk.metadata.category}\n# ${chunk.metadata.title}\n\n${chunk.metadata.description}\n\n${chunk.content}`
              )
              .join("\n---\n")}`,
          },
          ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
        ],
        stream: true,
      });

      let content = "";
      for await (const part of stream) {
        if (aborted) break;

        const delta = part.choices[0]?.delta?.content || "";
        content += delta;
        message.content = content;

        onUpdate?.(content);
      }

      // Get the top score, and only show others if they are within 0.3
      const contentWithLinks = addSourceLinks(content, relevant);
      message.content = contentWithLinks;
      onEnd?.(contentWithLinks);
    } catch (error) {
      console.error("Error generating completion:", error);
      message.content = "Sorry, something went wrong.";
      onEnd?.(message.content);
    }
  }

  return {
    async prompt(text, onUpdate, onEnd) {
      messages.push({
        role: "user",
        content: text,
      });

      await generateNew(onUpdate, onEnd);
    },
    async regenerateLast(onUpdate, onEnd) {
      const last = messages.at(-1);
      if (!last || last.role === "user") {
        return;
      }

      messages.pop();
      await generateNew(onUpdate, onEnd);
    },
    getHistory() {
      return messages;
    },
    clearHistory() {
      messages = [];
    },
    abortAnswer() {
      aborted = true;
    },
  };
}
