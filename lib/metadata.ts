import type { Metadata } from "next/types";

export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
    (process.env.NODE_ENV === "development" && `http://localhost:${process.env.PORT || 3000}`) ||
    "https://docs.recall.network"
);

const defaultTitle = "Recall Docs";
const defaultDescription = "Docs and guides for the Recall Network";
const images = `${baseUrl.toString()}img/og-image.png`;

export const defaultMetadata = {
  title: defaultTitle,
  description: defaultDescription,
  openGraph: {
    title: defaultTitle,
    siteName: defaultTitle,
    type: "website",
    locale: "en_US",
    description: defaultDescription,
    url: baseUrl.toString(),
    images,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@recallnet",
    title: defaultTitle,
    description: defaultDescription,
    images,
    site: defaultTitle,
  },
  metadataBase: baseUrl,
};

export function createMetadata(override: Metadata): Metadata {
  return {
    ...defaultMetadata,
    title: override.title ? `${override.title} | ${defaultTitle}` : defaultTitle,
    description: override.description ?? defaultDescription,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: override.title ?? defaultTitle,
      description: override.description ?? defaultDescription,
      url: override.openGraph?.url ?? baseUrl.toString(),
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: override.title ?? defaultTitle,
      description: override.description ?? defaultDescription,
    },
  };
}
