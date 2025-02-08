import { promises as fs } from "fs";
import { OpenAI } from "openai";
import path from "path";

import { MessageRecord } from "@/components/ai/context";
import {
  DocEmbedding,
  REJECTION_MESSAGE,
  SYSTEM_PROMPT,
  addSourceLinks,
  getRelevantChunks,
  isValidQuery,
} from "@/lib/embeddings";

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: MessageRecord[] };
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
    const filePath = path.join(process.cwd(), "public/embeddings.json");
    const embeddings = JSON.parse(await fs.readFile(filePath, "utf-8")) as DocEmbedding[];
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
      model: "gpt-4o-mini",
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

    // Create a transform stream to append source links
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      flush(controller) {
        // Add source links after the stream is done
        const sourceLinks = addSourceLinks("", relevant);
        const sourceJson = JSON.stringify({ source: sourceLinks }) + "\n"; // Match OpenAI response formatting
        controller.enqueue(new TextEncoder().encode(sourceJson));
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
