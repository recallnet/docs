import { createSearchAPI } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

// Check if page has leading `_` underscore, indicating it's a hidden page
const filteredPages = source.getPages().filter((page) => {
  console.log(page.slugs);
  console.log(page.file.path);
  return !page.file.path.includes("_");
});

export const { GET } = createSearchAPI("advanced", {
  indexes: filteredPages.map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    id: page.url,
    // @ts-expect-error the `page.data.structuredData` field exists
    structuredData: page.data.structuredData,
  })),
});
