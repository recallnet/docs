import { generateMarkdownFromSpec } from "../markdown-generator";

describe("generateMarkdownFromSpec", () => {
  test("generates markdown for a simple GET endpoint", () => {
    const spec = {
      paths: {
        "/api/test": {
          get: {
            summary: "Test endpoint",
            description: "A test endpoint for testing",
            parameters: [
              {
                name: "id",
                in: "query",
                description: "Test ID",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Success response",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        message: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const operations = [{ path: "/api/test", method: "get" }];
    const markdown = generateMarkdownFromSpec(spec, operations);

    expect(markdown).toContain("## GET /api/test");
    expect(markdown).toContain("**Test endpoint**");
    expect(markdown).toContain("A test endpoint for testing");
    expect(markdown).toContain("**Parameters:**");
    expect(markdown).toContain("`id` (query: string) (required)");
    expect(markdown).toContain("**Success Response:**");
  });

  test("handles missing operations gracefully", () => {
    const spec = {
      paths: {
        "/api/test": {
          get: {
            summary: "Test endpoint",
          },
        },
      },
    };

    const operations = [{ path: "/api/nonexistent", method: "get" }];
    const markdown = generateMarkdownFromSpec(spec, operations);

    expect(markdown).toBe("");
  });

  test("generates markdown for multiple operations", () => {
    const spec = {
      paths: {
        "/api/test": {
          get: { summary: "Get test" },
          post: { summary: "Create test" },
        },
      },
    };

    const operations = [
      { path: "/api/test", method: "get" },
      { path: "/api/test", method: "post" },
    ];
    const markdown = generateMarkdownFromSpec(spec, operations);

    expect(markdown).toContain("## GET /api/test");
    expect(markdown).toContain("## POST /api/test");
  });
});
