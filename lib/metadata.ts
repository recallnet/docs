import { createMetadataImage } from "fumadocs-core/server";
import type { Metadata } from "next/types";
import { source } from "./source";

export const baseUrl = new URL("https://docs.recall.network");

export const metadataImage = createMetadataImage({
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
