import { NextResponse } from "next/server";
import path from "path";

import { getApiDocContent, getRawDocContent } from "@/lib/files";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    // Slugs are passed in a way that makes the API URL a bit prettier, but we need to convert them
    // to the correct format for the file system to read the file:
    // 1. They have the `.mdx` extension converted to `.md`
    // 2. They have the `docs` slug prefix removed (removed from the passed github file url)
    const slug = (await params).slug.map((s) => s.replace(".md", ".mdx"));
    const filePath = path.join(process.cwd(), "docs", slug.join("/"));

    // Check if this is an API reference page
    const isApiReferencePage = slug.join("/").includes("reference/endpoints/");
    const isApiReferenceRootPage = slug.length === 2 && slug[0] === "reference" && slug[1] === "endpoints";
    const specPath = path.join(process.cwd(), "specs", "competitions.json");

    let docContent;
    if (isApiReferencePage && !isApiReferenceRootPage) {
      // For API pages, generate content from OpenAPI spec
      docContent = await getApiDocContent(filePath, specPath);
    } else {
      // For regular pages, use the existing method
      docContent = await getRawDocContent(filePath);
    }

    const { content, title, description } = docContent;
    const merged = `# ${title}\n\n${description}\n\n${content}`;
    const filename = slug.pop() || "index.md";

    return new NextResponse(merged, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `filename="${filename}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
