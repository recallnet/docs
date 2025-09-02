"use client";

import { ChevronDown, ClipboardCopy, Copy, ExternalLink, FileText, Map, NotebookText } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/theme/ui/collapsible";

interface MarkdownActionsProps {
  currentPath: string;
}

export function MarkdownActions({ currentPath }: MarkdownActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle hydration mismatch by waiting for client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get current URL for generating the LLM links - safely handled for SSR
  const [currentUrl, setCurrentUrl] = useState('');
  const [markdownUrl, setMarkdownUrl] = useState('');
  
  // Set up URLs once we're mounted on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      setCurrentUrl(baseUrl);
      
      // Convert paths like docs/tools/concepts.mdx to /raw/tools/concepts.md
      const path = currentPath.replace(/^docs\//, "").replace(/\.mdx$/, ".md");
      setMarkdownUrl(`${window.location.origin}/raw/${path}`);
    }
  }, [currentPath]);

  // Function to create Claude URL
  const getClaudeUrl = () => {
    if (!mounted || typeof window === 'undefined') return '#';
    return `https://claude.ai/new?q=${encodeURIComponent(`Read from ${currentUrl} so I can ask questions about it`)}`;
  };

  // Function to create ChatGPT URL
  const getChatGPTUrl = () => {
    if (!mounted || typeof window === 'undefined') return '#';
    return `https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read from ${currentUrl} so I can ask questions about it`)}`;
  };

  // Function to copy markdown content
  const copyMarkdown = async () => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      const response = await fetch(markdownUrl);
      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to copy markdown:', error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative hidden sm:flex">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="text-fd-muted-foreground bg-fd-secondary hover:text-fd-foreground hover:bg-fd-accent border-fd-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors">
            <ClipboardCopy size={18} />
            Copy page
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="bg-fd-popover border-fd-border absolute top-full right-0 z-50 mt-1 w-64 rounded-lg border p-1 shadow-lg">
          <div className="overflow-hidden rounded-md">
            <a
              href={getClaudeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 px-3 py-2.5 text-sm no-underline"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {mounted && (
                  <Image
                    src={
                      theme === "dark" || resolvedTheme === "dark"
                        ? "/icons/claude-dark.svg"
                        : "/icons/claude-light.svg"
                    }
                    alt="Claude Logo"
                    width={20}
                    height={20}
                  />
                )}
              </span>
              <div className="flex flex-col">
                <span>Ask Claude</span>
                <span className="text-fd-muted-foreground text-xs">Open this page in Claude</span>
              </div>
              <ExternalLink size={14} className="ml-auto opacity-70" />
            </a>

            <a
              href={getChatGPTUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 px-3 py-2.5 text-sm no-underline"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {mounted && (
                  <Image
                    src={
                      theme === "dark" || resolvedTheme === "dark"
                        ? "/icons/chatgpt-dark.svg"
                        : "/icons/chatgpt-light.svg"
                    }
                    alt="ChatGPT Logo"
                    width={20}
                    height={20}
                  />
                )}
              </span>
              <div className="flex flex-col">
                <span>Ask ChatGPT</span>
                <span className="text-fd-muted-foreground text-xs">Open this page in ChatGPT</span>
              </div>
              <ExternalLink size={14} className="ml-auto opacity-70" />
            </a>

            <div className="bg-fd-border my-1 h-px" />

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                copyMarkdown();
              }}
              className="text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 px-3 py-2.5 text-sm no-underline"
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <Copy size={16} />
              </span>
              <div className="flex flex-col text-left">
                <span>Copy as markdown</span>
                <span className="text-fd-muted-foreground text-xs">Copy page as plaintext</span>
              </div>
            </a>
            
            <a 
              href={mounted ? markdownUrl : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 px-3 py-2.5 text-sm no-underline"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <FileText size={16} />
              </span>
              <div className="flex flex-col">
                <span>Open in markdown</span>
                <span className="text-fd-muted-foreground text-xs">
                  Open this page in plaintext
                </span>
              </div>
              <ExternalLink size={14} className="ml-auto opacity-70" />
            </a>

            <div className="bg-fd-border my-1 h-px" />

            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 px-3 py-2.5 text-sm no-underline"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <Map size={16} />
              </span>
              <div className="flex flex-col">
                <span>llms.txt</span>
                <span className="text-fd-muted-foreground text-xs">Docs index for AI</span>
              </div>
              <ExternalLink size={14} className="ml-auto opacity-70" />
            </a>

            <a
              href="/llms-full.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 px-3 py-2.5 text-sm no-underline"
              onClick={() => setIsOpen(false)}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                <NotebookText size={16} />
              </span>
              <div className="flex flex-col">
                <span>Full Documentation</span>
                <span className="text-fd-muted-foreground text-xs">Complete docs as text</span>
              </div>
              <ExternalLink size={14} className="ml-auto opacity-70" />
            </a>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
