"use client";

import Link from "fumadocs-core/link";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Loader2, SquareArrowUp } from "lucide-react";
import {
  type HTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  use,
  useEffect,
  useRef,
  useState,
} from "react";

import { buttonVariants } from "@/components/theme/ui/button";
import { cn } from "@/lib/theme/cn";

import { AIProvider, Context, type MessageRecord } from "./context";
import type { Processor } from "./markdown-processor";
import { getRandomSuggestions } from "./suggestions";

const listeners: (() => void)[] = [];

function onUpdate() {
  for (const listener of listeners) listener();
}

function ChatView() {
  const [, update] = useState(0);
  const shouldFocus = useRef(false);
  const { loading, setLoading, engine } = use(Context);
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);

  // Generate random suggestions on client side only to avoid hydration mismatch
  useEffect(() => {
    setInitialSuggestions(getRandomSuggestions(3));
  }, []);

  const onSubmit = (message: string) => {
    if (!engine || message.length === 0) return;

    setLoading(true);
    void engine
      .prompt(message, onUpdate, () => {
        onUpdate(); // Final update to trigger markdown processing
      })
      .finally(() => {
        setLoading(false);
        shouldFocus.current = true;
      });
  };

  useEffect(() => {
    const listener = () => {
      update((prev) => prev + 1);
    };

    listeners.push(listener);
    return () => {
      listeners.splice(listeners.indexOf(listener), 1);
    };
  }, []);

  useEffect(() => {
    if (shouldFocus.current) {
      document.getElementById("nd-landing-chat-input")?.focus();
      shouldFocus.current = false;
    }
  });

  const messages = engine?.getHistory() ?? [];
  const hasMessages = messages.length > 0;

  // Show contextual suggestions from last assistant message, or initial suggestions
  const lastAssistantMessage = messages.findLast((m) => m.role === "assistant");
  const suggestions = lastAssistantMessage?.suggestions ?? (hasMessages ? [] : initialSuggestions);

  return (
    <div
      className={cn(
        "mx-auto max-w-5xl px-4",
        hasMessages ? "flex min-h-[calc(100vh-4rem)] flex-col py-4" : "py-4"
      )}
    >
      {/* Hero Section */}
      {!hasMessages && (
        <div className="animate-in fade-in mb-8 space-y-3 text-center duration-500">
          <h1 className="text-3xl font-bold">Welcome to Recall</h1>
          <p className="text-muted-foreground text-base">
            The world's first decentralized skill market for AI
          </p>
        </div>
      )}

      {/* Chat Messages and Input */}
      <MessageList hasMessages={hasMessages}>
        {messages.map((item, i) => (
          <Message key={i} message={item} />
        ))}
        <ChatInput loading={loading} onSubmit={onSubmit} suggestions={suggestions} />
      </MessageList>
    </div>
  );
}

function ChatInput({
  loading,
  onSubmit,
  suggestions,
}: {
  loading: boolean;
  onSubmit: (message: string) => void;
  suggestions: string[];
}) {
  const [message, setMessage] = useState("");

  const onStart = (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessage("");
    onSubmit(message);
  };

  const onSuggestionClick = (suggestion: string) => {
    // Submit suggestion directly without setting input value
    onSubmit(suggestion);
  };

  // IDEA: Implement ChatGPT-like autocomplete that filters suggestions as user types
  // This would provide real-time discovery of relevant questions based on partial input

  return (
    <div className="space-y-3">
      {/* Input field */}
      <form
        className={cn(
          "bg-fd-accent flex flex-row items-center border pe-2 transition-colors",
          loading && "bg-fd-muted"
        )}
        onSubmit={onStart}
      >
        <Input
          value={message}
          placeholder={loading ? "AI is answering" : "Ask anything"}
          disabled={loading}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={(event) => {
            if (!event.shiftKey && event.key === "Enter") {
              onStart();
              event.preventDefault();
            }
          }}
        />
        {loading ? (
          <Loader2 className="text-fd-muted-foreground size-5 animate-spin" />
        ) : (
          <button
            type="submit"
            className={cn("p-2")}
            style={{ color: "#0064C7" }}
            disabled={message.length === 0}
          >
            <SquareArrowUp className="size-5" />
          </button>
        )}
      </form>

      {/* Suggestions - only visible when input is empty */}
      {!message && suggestions.length > 0 && (
        <div className="flex flex-col">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "text-fd-muted-foreground hover:text-fd-foreground px-4 py-3 text-left text-sm transition-colors",
                i > 0 && "border-fd-border border-t"
              )}
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageList({ children, hasMessages }: { children: ReactNode; hasMessages: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const observer = new ResizeObserver(() => {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "instant",
      });
    });

    // Set initial scroll position to bottom
    containerRef.current.scrollTop =
      containerRef.current.scrollHeight - containerRef.current.clientHeight;

    // Observe the content wrapper to track size changes during streaming
    setTimeout(() => {
      if (contentRef.current) {
        observer.observe(contentRef.current);
      }
    }, 100);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={cn(hasMessages ? "min-h-0 flex-1 overflow-y-auto" : "")}>
      <div ref={contentRef} className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function Input(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const shared = cn("col-start-1 row-start-1 max-h-60 px-4 py-2.5 leading-normal");

  return (
    <div className="grid flex-1 items-center">
      <textarea
        id="nd-landing-chat-input"
        className={cn(
          shared,
          "placeholder:text-fd-muted-foreground resize-none bg-transparent focus-visible:outline-none"
        )}
        rows={1}
        {...props}
      />
      <div className={cn(shared, "invisible whitespace-pre-wrap")}>
        {`${props.value?.toString() ?? ""}\n`}
      </div>
    </div>
  );
}

let processor: Processor | undefined;
const map = new Map<string, ReactNode>();

const roleName: Record<string, string> = {
  user: "User",
  assistant: "Recall Docs Agent",
};

function Message({ message }: { message: MessageRecord }) {
  const { loading } = use(Context);
  const { references = [] } = message;
  const isUser = message.role === "user";
  const isEmptyAssistantMessage = message.role === "assistant" && !message.content;

  return (
    <div className={cn("flex", isUser && "justify-end")}>
      <div
        className={cn(
          "max-w-[85%]",
          isUser
            ? "bg-fd-secondary text-fd-secondary-foreground px-3 py-1.5"
            : "text-fd-foreground space-y-2"
        )}
      >
        {!isUser && !isEmptyAssistantMessage && (
          <div className="prose prose-sm max-w-none">
            <Markdown text={message.content} />
          </div>
        )}
        {isUser && <p className="!m-0 text-sm leading-relaxed">{message.content}</p>}

        {/* References */}
        {references.length > 0 && (
          <div className="flex flex-row flex-wrap items-center gap-2">
            <p className="text-xs font-bold">References:</p>
            {references.map((item, i) => (
              <Link
                key={i}
                href={item.url}
                className="bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground block rounded-lg border px-2 py-1 text-xs transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
        {/* IDEA: Wikipedia-style hover previews for references
            Show preview popup when hovering over reference numbers or links
            with page title, description, and thumbnail */}
      </div>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const [rendered, setRendered] = useState<ReactNode>(map.get(text));
  const { loading } = use(Context);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const prevTextRef = useRef<string | undefined>(undefined);
  const prevLoadingRef = useRef<boolean | undefined>(undefined);

  async function run(textToProcess: string) {
    const { createProcessor } = await import("./markdown-processor");

    processor ??= createProcessor();
    let result = map.get(textToProcess);

    if (!result) {
      result = await processor
        .process(textToProcess, {
          ...defaultMdxComponents,
          img: undefined, // use JSX
        })
        .catch(() => textToProcess);
      map.set(textToProcess, result);
    }

    setRendered(result);
  }

  useEffect(() => {
    const textChanged = text !== prevTextRef.current;
    const loadingChanged = loading !== prevLoadingRef.current;

    prevTextRef.current = text;
    prevLoadingRef.current = loading;

    // Check if we have this text cached
    const cached = map.get(text);
    if (cached && textChanged) {
      // Use cached version immediately
      setRendered(cached);
      return;
    }

    // Clear any pending processing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If text changed, show raw text immediately while processing
    if (textChanged && !cached) {
      setRendered(text);
    }

    // If loading just changed from true to false, process immediately
    if (loadingChanged && !loading) {
      void run(text);
      return;
    }

    // During streaming, debounce markdown processing
    if (loading && textChanged) {
      timeoutRef.current = setTimeout(() => {
        void run(text);
      }, 150);
    }

    // If not loading and text changed, process immediately
    if (!loading && textChanged) {
      void run(text);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, loading]);

  return rendered ?? text;
}

export function LandingChat() {
  return (
    <AIProvider type="openai" loadEngine={true}>
      <ChatView />
    </AIProvider>
  );
}
