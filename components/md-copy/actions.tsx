"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, ClipboardCopy, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/theme/ui/button";
import { cn } from "@/lib/theme/cn";

interface MarkdownActionsProps {
  currentPath: string;
}

export function MarkdownActions({ currentPath }: MarkdownActionsProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRawPath = () => {
    // Convert paths like docs/tools/concepts.mdx to /raw/tools/concepts.md
    // This uses the `raw/[...slug]` route to serve the markdown file
    const path = currentPath.replace(/^docs\//, "").replace(/\.mdx$/, ".md");
    return `/raw/${path}`;
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(getRawPath());
      if (!response.ok) {
        throw new Error(`Failed to fetch markdown content: ${response.statusText}`);
      }
      const content = await response.text();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy content");
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleView = () => {
    window.open(getRawPath(), "_blank");
  };

  return (
    <div className="hidden sm:flex">
      <button
        onClick={handleCopy}
        className={cn(
          buttonVariants({ color: "secondary" }),
          "gap-2 rounded-r-none border-r-0 text-sm font-normal"
        )}
      >
        {copied ? (
          <>
            <Check className="size-4" />
            Copied!
          </>
        ) : error ? (
          <>
            <ClipboardCopy className="size-4" />
            {error}
          </>
        ) : (
          <>
            <ClipboardCopy className="size-4" />
            Copy page
          </>
        )}
      </button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className={cn(
            buttonVariants({ color: "secondary" }),
            "border-l-border dark:border-l-fd-background rounded-l-none border-l px-2 focus:outline-none"
          )}
        >
          <ChevronDown className="size-4" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-popover text-popover-foreground z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md"
            align="end"
          >
            <DropdownMenu.Item
              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none"
              onClick={handleCopy}
            >
              <ClipboardCopy className="mr-2 size-4" />
              <div className="flex flex-col">
                <span>Copy page</span>
                <span className="text-muted-foreground text-xs">
                  Copy this page as markdown for LLMs
                </span>
              </div>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none"
              onClick={handleView}
            >
              <FileText className="mr-2 size-4" />
              <div className="flex flex-col">
                <span className="flex items-center">
                  View as markdown <ExternalLink className="ml-2 size-3" />
                </span>
                <span className="text-muted-foreground text-xs">
                  View this page as plain markdown text
                </span>
              </div>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
