"use client";

import { usePathname } from "next/navigation";

import { MarkdownActions } from "./actions";

export function MarkdownActionsClient() {
  const pathname = usePathname();
  console.log("PATHNAME", pathname);
  return <MarkdownActions currentPath={pathname} />;
}
