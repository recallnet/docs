import { promises as fs } from "fs";
import { OpenAI } from "openai";
import path from "path";

import { MessageRecord } from "@/components/ai/context";
import { SUGGESTED_QUESTIONS } from "@/components/ai/suggestions";
import {
  DocsEmbedding,
  REJECTION_MESSAGE,
  SYSTEM_PROMPT,
  getReferenceLinks,
  getRelevantChunks,
  isValidQuery,
} from "@/lib/ai";

export const revalidate = false;

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

const MODEL = "gpt-4o-mini";
const MAX_SESSION_REQUESTS = 50;
const MAX_SESSION_AGE = 60 * 60 * 1000;
const EMBEDDINGS_FILE = path.join(process.cwd(), "public", "static", "embeddings.json");

// Naive session management
const sessions = new Map<
  string,
  {
    requests: number;
    lastAccess: number;
    lastReset: number; // Track when we last reset requests
  }
>();

// Cleanup old sessions every 60 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    // Reset request count if an hour has passed since last reset
    if (now - session.lastReset > MAX_SESSION_AGE) {
      session.requests = 0;
      session.lastReset = now;
    }
    // Remove session if inactive for an hour
    if (now - session.lastAccess > MAX_SESSION_AGE) {
      sessions.delete(id);
    }
  }
}, MAX_SESSION_AGE);

/**
 * Generate contextual follow-up suggestions based on the conversation.
 * Uses OpenAI to pick 3 most relevant questions from the curated pool and rephrase them
 * to fit the conversation context.
 */
async function generateContextualSuggestions(
  client: OpenAI,
  conversationHistory: MessageRecord[]
): Promise<string[]> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are helping generate follow-up questions for a user chatting with the Recall documentation AI.

Here is a curated pool of key questions:
${SUGGESTED_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Based on the conversation history, pick 3 most relevant questions from this pool and rephrase them to fit the conversation context as potential follow-up questions shown to the user for their next input.

Return ONLY a JSON array of 3 strings, nothing else. Example: ["Question 1?", "Question 2?", "Question 3?"]`,
        },
        ...conversationHistory,
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return [];

    // Parse the JSON array response
    const suggestions = JSON.parse(content) as string[];
    return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    // Fallback to random questions if generation fails
    return [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 3);
  }
}

export async function POST(request: Request) {
  if (!openai) {
    return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
      status: 503,
    });
  }
  try {
    const { sessionId, messages } = (await request.json()) as {
      sessionId: string;
      messages: MessageRecord[];
    };
    const session = sessions.get(sessionId) || {
      requests: 0,
      lastAccess: Date.now(),
      lastReset: Date.now(),
    };
    session.requests++;
    session.lastAccess = Date.now();
    sessions.set(sessionId, session);

    if (session.requests > MAX_SESSION_REQUESTS) {
      return new Response(
        JSON.stringify({
          rejection: true,
          content:
            "You've maxed out your number of chats...join our Discord server and reach out to us there!",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const query = messages.filter((msg) => msg.role === "user").at(-1)?.content;
    if (!query || !isValidQuery(query)) {
      return new Response(
        JSON.stringify({
          rejection: true,
          content: REJECTION_MESSAGE,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Get relevant chunks for the query
    const embeddings = JSON.parse(await fs.readFile(EMBEDDINGS_FILE, "utf-8")) as DocsEmbedding[];
    const relevant = await getRelevantChunks(openai, query, embeddings);
    if (relevant.length === 0) {
      return new Response(
        JSON.stringify({
          rejection: true,
          content: REJECTION_MESSAGE,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Create chat completion stream
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Here are the most relevant documentation sections:\n\n${relevant
            .map(
              (chunk) =>
                `Source: ${chunk.metadata.file}\nCategories: ${chunk.metadata.category};${chunk.metadata.keywords}\n# ${chunk.metadata.title}\n\n${chunk.metadata.description}\n\n${chunk.content}`
            )
            .join("\n---\n")}`,
        },
        ...messages,
      ],
      stream: true,
    });

    // Create a transform stream to append source links and suggestions
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      async flush(controller) {
        // Add reference links after the stream is done
        const referenceLinks = getReferenceLinks(relevant);
        const sourceJson = JSON.stringify({ references: referenceLinks }) + "\n";
        controller.enqueue(new TextEncoder().encode(sourceJson));

        // Generate and add contextual suggestions
        const suggestions = await generateContextualSuggestions(openai, messages);
        const suggestionsJson = JSON.stringify({ suggestions }) + "\n";
        controller.enqueue(new TextEncoder().encode(suggestionsJson));
      },
    });

    return new Response(stream.toReadableStream().pipeThrough(transform), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
    });
  }
}
