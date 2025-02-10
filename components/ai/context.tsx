"use client";

import { type ReactNode, createContext, useEffect, useMemo, useRef, useState } from "react";

export interface Engine {
  prompt: (
    text: string,
    onUpdate?: (full: string) => void,
    onEnd?: (full: string) => void
  ) => Promise<void>;

  abortAnswer: () => void;
  getHistory: () => MessageRecord[];
  clearHistory: () => void;
  regenerateLast: (
    onUpdate?: (full: string) => void,
    onEnd?: (full: string) => void
  ) => Promise<void>;
}

export interface MessageRecord {
  role: "user" | "assistant";
  content: string;

  suggestions?: string[];
  references?: MessageReference[];
}

export interface MessageReference {
  breadcrumbs?: string[];
  title: string;
  description?: string;
  url: string;
}

type EngineType = "openai";

export const Context = createContext<{
  engine?: Engine;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({
  loading: false,
  setLoading: () => undefined,
});

export function AIProvider({
  type,
  children,
  loadEngine = false,
}: {
  type: EngineType;
  children: ReactNode;
  loadEngine?: boolean;
}) {
  const pendingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<Engine>();

  useEffect(() => {
    if (!loadEngine || pendingRef.current) return;
    pendingRef.current = true;
    // preload processor
    void import("./markdown-processor");

    if (type === "openai") {
      void import("./engines/openai").then(async (res) => {
        setEngine(await res.createOpenAIEngine());
      });
    }
  }, [type, loadEngine]);

  return (
    <Context
      value={useMemo(
        () => ({
          loading,
          setLoading,
          engine,
        }),
        [engine, loading]
      )}
    >
      {children}
    </Context>
  );
}
