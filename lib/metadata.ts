import { createMetadataImage } from "fumadocs-core/server";
import type { Metadata } from "next/types";

import { source } from "./source";

export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    (process.env.NODE_ENV === "development" &&
      `http://localhost:${process.env.PORT || 3000}`) ||
    "https://docs.recall.network",
);

// @eslint-disable-next-line @typescript-eslint/no-unused-vars
export const metadataImage: ReturnType<typeof createMetadataImage> =
  createMetadataImage({
    imageRoute: "/og",
    source,
  });

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: baseUrl.toString(),
      images: "/img/recall-dark.svg",
      siteName: "Recall",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@recallnet",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: "/img/recall-dark.svg",
      ...override.twitter,
    },
  };
}
