import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

import { source } from "@/lib/source";

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  try {
    // Remove .md extension if present and handle index.md case
    console.log("SLUG PASSED IN", await params.slug);
    const slug = params.slug.map((segment) => segment.replace(/\.md$/, ""));
    if (slug[slug.length - 1] === "index") {
      slug.pop(); // Remove 'index' from the end
    }

    const page = source.getPage(slug);
    if (!page) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Read the raw markdown file
    const filePath = path.join(process.cwd(), "docs", page.file.path);
    const content = await readFile(filePath, "utf-8");

    // Use the same filename format as GitHub
    const filename = page.file.path.split("/").pop() || "index.mdx";

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error serving markdown file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
