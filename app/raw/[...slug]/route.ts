import { NextResponse } from "next/server";
import path from "path";
import fs from "node:fs/promises";

import { getRawDocContent } from "@/lib/files";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    // Slugs are passed in a way that makes the API URL a bit prettier, but we need to convert them
    // to the correct format for the file system to read the file:
    // 1. They have the `.mdx` extension converted to `.md`
    // 2. They have the `docs` slug prefix removed (removed from the passed github file url)
    const slug = (await params).slug.map((s) => s.replace(".md", ".mdx"));

    // Check if this is an API reference page
    const isApiReferencePage = slug.join("/").includes("reference/endpoints/");
    const isApiReferenceRootPage = slug.length === 2 && slug[0] === "reference" && slug[1] === "endpoints";

    let content: string;
    let filename: string;

    if (isApiReferencePage && !isApiReferenceRootPage) {
      // For API pages, serve pre-generated markdown
      const lastSlug = slug[slug.length - 1];
      if (!lastSlug) {
        throw new Error("Invalid slug");
      }
      const markdownFileName = lastSlug.replace(".mdx", ".md");
      const markdownPath = path.join(
        process.cwd(),
        ".source",
        "markdown",
        "endpoints",
        markdownFileName
      );

      // Read pre-generated markdown file
      content = await fs.readFile(markdownPath, "utf8");
      filename = markdownFileName;
    } else {
      // For regular pages, use the existing method
      const filePath = path.join(process.cwd(), "docs", slug.join("/"));
      const docContent = await getRawDocContent(filePath);
      content = `# ${docContent.title}\n\n${docContent.description}\n\n${docContent.content}`;
      filename = slug.pop() || "index.md";
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `filename="${filename}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
