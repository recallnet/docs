import type { Metadata } from "next/types";

export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
    (process.env.NODE_ENV === "development" && `http://localhost:${process.env.PORT || 3000}`) ||
    "https://docs.recall.network"
);

export const defaultMetadata = {
  title: {
    template: "%s | Recall Docs",
    default: "Recall Docs",
  },
  description: "Docs and guides for the Recall Network",
  openGraph: {
    title: "Recall Docs",
    siteName: "Recall Docs",
    type: "website",
    locale: "en_US",
    description: "Docs and guides for the Recall Network",
    url: baseUrl.toString(),
    images: "/img/og-image.png",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@recallnet",
    title: "Recall Docs",
    description: "Docs and guides for the Recall Network",
    images: "/img/og-image.png",
    site: "Recall Docs",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  metadataBase: baseUrl,
};

export function createMetadata(override: Metadata): Metadata {
  const title = override.title ?? defaultMetadata.title.default;
  const description = override.description ?? defaultMetadata.description;
  const ogUrl = override.openGraph?.url ?? baseUrl.toString();

  return {
    ...defaultMetadata,
    ...override,
    title,
    description,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...override.openGraph,
      title,
      description,
      url: ogUrl,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...override.twitter,
      title,
      description,
    },
  };
}
