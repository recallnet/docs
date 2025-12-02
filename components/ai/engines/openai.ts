import type { Engine, MessageRecord } from "@/components/ai/context";
import { MessageReference } from "@/components/ai/context";
import { REJECTION_MESSAGE } from "@/lib/ai";

type OpenAIResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  service_tier: string;
  system_fingerprint: string;
  choices: {
    index: number;
    delta: { content: string };
    logprobs: boolean | null;
    finish_reason: string | null;
  }[];
};

type ReferencesResponse = {
  references: MessageReference[];
};

type SuggestionsResponse = {
  suggestions: string[];
};

export async function createOpenAIEngine(): Promise<Engine> {
  const sessionId = localStorage.getItem("recallChatSessionId") || crypto.randomUUID();
  localStorage.setItem("recallChatSessionId", sessionId);

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
        body: JSON.stringify({ sessionId, messages }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat request failed");
      }

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

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (aborted || !line.trim()) continue;

          const json = JSON.parse(line);
          if ("choices" in json && Array.isArray(json.choices)) {
            const delta = (json as OpenAIResponse).choices[0]?.delta?.content || "";
            if (delta) {
              content += delta;
              message.content = content;
              onUpdate?.(content);
            }
            continue;
          }
          if ("references" in json && !content.includes(REJECTION_MESSAGE)) {
            const data = json as ReferencesResponse;
            message.references = data.references;
            onUpdate?.(content);
          }
          if ("suggestions" in json && !content.includes(REJECTION_MESSAGE)) {
            const data = json as SuggestionsResponse;
            message.suggestions = data.suggestions;
            onUpdate?.(content);
          }
        }
      }

      onEnd?.(content);
    } catch {
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
