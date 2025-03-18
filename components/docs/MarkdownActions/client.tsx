"use client";

import { usePathname } from "next/navigation";

import { MarkdownActions } from "./index";

export function MarkdownActionsClient() {
  const pathname = usePathname();
  return <MarkdownActions currentPath={pathname} />;
}
