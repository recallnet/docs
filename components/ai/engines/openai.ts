import { OpenAI } from "openai";

import type { Engine, MessageRecord } from "@/components/ai/context";
import { baseUrl } from "@/lib/metadata";

export type RAGDocument = {
  file: string;
  category: string;
  title: string;
  description: string;
  keywords?: string;
  content: string;
};

type RelevantChunk = {
  content: string;
  metadata: {
    file: string;
    title: string;
    description: string;
    category: string;
    keywords?: string;
  };
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

async function fetchDocsContext(): Promise<RAGDocument[]> {
  const response = await fetch("/api/rag");
  if (!response.ok) throw new Error("Failed to fetch docs context");
  return (await response.json()) as RAGDocument[];
}

function addSourceLinks(content: string, relevantChunks: RelevantChunk[]): string {
  const topScore = Math.max(...relevantChunks.map((chunk) => chunk.score));

  // Only include sources that are within 0.05 of the top score
  const closeMatches = relevantChunks.filter((chunk) => chunk.score >= topScore - 0.05);
  // First, collect all unique source files
  const sources = new Map(
    closeMatches.map((chunk) => [
      chunk.metadata.file,
      {
        file: chunk.metadata.file,
        title: chunk.metadata.title,
      },
    ])
  );

  // Add links section if it doesn't exist
  if (!content.includes("**Source(s)**:")) {
    content += "\n\n**Source(s)**:\n";
  }

  // Add linked sources
  content += Array.from(sources.values())
    .map(({ file, title }) => `[${title}](${baseUrl}${file})`)
    .join(", ")
    .replace(/,\s*$/, "");

  // Replace footnote references with links
  sources.forEach(({ file, title }) => {
    const regex = new RegExp(`\\[\\^(\\d+)\\]: ${file}`, "g");
    content = content.replace(regex, `[^$1]: [${title}](${baseUrl}${file})`);
  });
  return content;
}

// Ensure content doesn't hit the ada-002 limit of 8192 tokens
function splitIntoChunks(doc: RAGDocument, maxTokens: number = 6000): RAGDocument[] {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;

  if (doc.content.length <= maxChars) {
    return [doc];
  }

  // Split at major section boundaries first
  const sections = doc.content.split(/(?=^#{1,3}\s)/m);

  // If sections are still too large, split them further
  const chunks: RAGDocument[] = [];
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

async function getRelevantChunks(
  query: string | undefined,
  docs: RAGDocument[]
): Promise<RelevantChunk[]> {
  if (!query) return [];
  // Split large documents into smaller chunks
  const allChunks = docs.flatMap((doc) => splitIntoChunks(doc));

  const embeddingResponse = await withRetry(() =>
    openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: [query, ...allChunks.map((chunk) => chunk.content)]
        .map((text) => text.trim())
        .filter((text) => text.length > 0),
    })
  );

  if (!embeddingResponse.data[0]?.embedding) throw new Error("Failed to get embedding response");
  const queryEmbedding = embeddingResponse.data[0].embedding;
  const docEmbeddings = embeddingResponse.data.slice(1).map((e) => e.embedding);

  const scores = docs.map((doc, index) => {
    const embeddingScore = cosineSimilarity(queryEmbedding, docEmbeddings[index] ?? []);
    const keywordScore = keywordMatch(query, doc.keywords);

    // Weight embedding score 70%, keyword score 30%
    const combinedScore = embeddingScore * 0.7 + keywordScore * 0.3;

    return {
      content: doc.content,
      metadata: {
        file: doc.file,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        keywords: doc.keywords,
      },
      score: combinedScore,
      // Add debug info
      debug: {
        embeddingScore,
        keywordScore,
        combinedScore,
        keywords: doc.keywords,
      },
    };
  });

  // Log for debugging
  console.log("Query:", query);
  console.log(
    "Top 3 matches:",
    scores
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

  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * (b?.[i] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi ** 2, 0));
  return dotProduct / (normA * normB);
}

const SYSTEM_PROMPT = `
You are a helpful assistant with expert knowledge of the Recall Network and its documentation.
You are given a question and a list of relevant documentation chunks.
Your job is to answer the question using the provided documentation.
You MUST be concise but provide a brief helpful answer. Only answer questions about Recall and its documentation.
If you don't know the answer, just say "Hmm, I'm not sure if that's relevant to Recall. Try asking a different question?".
Do NOT make up an answer about Recall-specifics, or make assumptions on what Recall code might look like.
Only reference code that is provided in the documentation, any remove instances of \`// [!code highlight]\` if applicable.
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
  console.log("docsContext", docsContext);

  async function generateNew(onUpdate?: (full: string) => void, onEnd?: (full: string) => void) {
    aborted = false;
    const message: MessageRecord = {
      role: "assistant",
      content: "",
    };

    messages.push(message);
    console.log("messages", messages.at(-1));
    const relevant = await getRelevantChunks(
      messages.filter((msg) => msg.role === "user").at(-1)?.content,
      docsContext
    );
    console.log("relevant", relevant);
    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4",
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
