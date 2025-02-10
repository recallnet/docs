import path from "node:path";

import { getDocsContent } from "@/lib/files";

const DOCS_DIR = path.join(process.cwd(), "docs");

export async function GET() {
  const files = await getDocsContent(DOCS_DIR);

  const scan = files.map(async (item) => {
    return `file: ${item.file}
# ${item.title}

${item.category && `Category: ${item.category}`}
${item.description && `Description: ${item.description}`}
${item.keywords && `Keywords: ${item.keywords}`}

${item.content}
---
`;
  });

  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"));
}
