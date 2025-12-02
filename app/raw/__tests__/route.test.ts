import { NextRequest } from "next/server";
import { GET } from "../[...slug]/route";

describe("/raw endpoint", () => {
  test("serves pre-generated markdown for API endpoints", async () => {
    const params = Promise.resolve({
      slug: ["reference", "endpoints", "agent.md"],
    });

    const response = await GET(
      new NextRequest("http://localhost:3000/raw/reference/endpoints/agent.md"),
      { params }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/markdown");

    const content = await response.text();
    expect(content).toContain("# Agent");
    expect(content).toContain("## GET /api/agent/profile");
    // Verify it contains the markdown format from pre-generated files
    expect(content).toContain("**Get authenticated agent profile**");
  });

  test("serves regular MDX content for non-API pages", async () => {
    const params = Promise.resolve({
      slug: ["competitions", "paper-trading.md"],
    });

    const response = await GET(
      new NextRequest("http://localhost:3000/raw/competitions/paper-trading.md"),
      { params }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/markdown");
  });

  test("returns 404 for non-existent files", async () => {
    const params = Promise.resolve({
      slug: ["nonexistent.md"],
    });

    const response = await GET(
      new NextRequest("http://localhost:3000/raw/nonexistent.md"),
      { params }
    );

    expect(response.status).toBe(404);
  });
});
