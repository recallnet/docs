import { createSearchAPI } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

// Check if page has leading `_` underscore, indicating it's a hidden page
const filteredPages = source.getPages().filter((page) => {
  return !page.file.path.includes("_");
});

export const { GET } = createSearchAPI("advanced", {
  indexes: filteredPages.map((page) => ({
    title: page.data.title ?? "", // Provide default empty string
    description: page.data.description ?? "", // Provide default empty string
    url: page.url,
    id: page.url,
    // @ts-expect-error the `page.data.structuredData` field exists
    structuredData: page.data?.structuredData ?? null,
  })),
});
