import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

import { source } from "@/lib/source";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("path")?.split("/").filter(Boolean) || [];
    const page = source.getPage(slug);
    console.log("slug", slug);

    if (!page) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Read the raw markdown file
    const filePath = path.join(process.cwd(), "docs", page.file.path);
    const content = await readFile(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `filename="${page.file.path}"`,
      },
    });
  } catch (error) {
    console.error("Error serving markdown file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
