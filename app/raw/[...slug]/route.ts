import { NextResponse } from "next/server";
import path from "path";

import { getRawDocContent } from "@/lib/files";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    // Slugs are passed in a way that makes the API URL a bit prettier, but we need to convert them
    // to the correct format for the file system to read the file:
    // 1. They have the `.mdx` extension converted to `.md`
    // 2. They have the `docs` slug prefix removed (removed from the passed github file url)
    const slug = (await params).slug.map((s) => s.replace(".md", ".mdx"));
    const filePath = path.join(process.cwd(), "docs", slug.join("/"));
    const content = await getRawDocContent(filePath);
    const filename = slug.pop() || "index.md";

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
