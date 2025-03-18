"use client";

import { usePathname } from "next/navigation";

import { MarkdownActions } from "./actions";

export function MarkdownActionsClient() {
  const pathname = usePathname();
  return <MarkdownActions currentPath={pathname} />;
}
