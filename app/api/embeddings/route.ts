import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public/embeddings.json");
    const embeddings = await fs.readFile(filePath, "utf-8");
    return new Response(embeddings, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Embeddings not found", { status: 404 });
  }
}
