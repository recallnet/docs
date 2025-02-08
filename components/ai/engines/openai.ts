import { Stream } from "openai/streaming";

import type { Engine, MessageRecord } from "@/components/ai/context";

export async function createOpenAIEngine(): Promise<Engine> {
  let messages: MessageRecord[] = [];
  let aborted = false;

  async function generateNew(onUpdate?: (full: string) => void, onEnd?: (full: string) => void) {
    aborted = false;
    const message: MessageRecord = {
      role: "assistant",
      content: "",
    };
    messages.push(message);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat request failed");
      }

      // Handle rejection message
      // Check if it's a rejection response
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        if (data.rejection) {
          let content = "";
          const streamText = async function* streamText(text: string, delay: number = 5) {
            for (const char of text) {
              yield char;
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          };
          for await (const char of streamText(data.content)) {
            if (aborted) break;
            content += char;
            message.content = content;
            onUpdate?.(content);
          }
          onEnd?.(content);
          return;
        }
      }
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      let partialLine = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const fullChunk = partialLine + chunk;

        // Process each line (SSE streams send data in lines)
        const lines = fullChunk.split("\n");
        partialLine = lines.pop() || "";

        for await (const part of lines) {
          if (aborted) break;
          if (!part.trim()) continue;
          const json = JSON.parse(part);
          const delta = json.choices?.[0]?.delta?.content || "";
          if (delta) {
            content += delta;
            message.content = content;
            onUpdate?.(content);
          }
        }
      }
      onEnd?.(content);
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
