import { promises as fs } from "fs";
import path from "path";

const EMBEDDINGS_FILE = path.join(process.cwd(), "public", "static", "embeddings.json");

export async function GET() {
  try {
    const embeddings = await fs.readFile(EMBEDDINGS_FILE, "utf-8");
    return new Response(embeddings, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Embeddings not found", { status: 404 });
  }
}
