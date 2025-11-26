import fs from "fs/promises";

const SOURCE_URL = process.env.OPENAPI_SOURCE_URL;
const OUTPUT_PATH = "specs/competitions.json";

const BLOCKED_PATH_PATTERNS = [
  /^\/api\/admin\//,
  /^\/api\/user\//,
  /^\/api\/auth\/login$/,
  /^\/api\/competitions\/[^/]+\/partners$/,
  /^\/nfl\//,
];

const BLOCKED_TAGS = ["Admin", "User", "NFL"];

function isPathBlocked(path: string): boolean {
  return BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

async function main(): Promise<void> {
  try {
    if (!SOURCE_URL) {
      throw new Error("OPENAPI_SOURCE_URL environment variable is required");
    }
    console.log(`Fetching OpenAPI spec from ${SOURCE_URL}...`);

    const response = await fetch(SOURCE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const spec = await response.json();

    if (!spec || typeof spec !== "object") {
      throw new Error("Invalid response: expected JSON object");
    }
    if (!spec.paths || typeof spec.paths !== "object") {
      throw new Error("Invalid OpenAPI spec: missing or invalid paths property");
    }

    const originalPathCount = Object.keys(spec.paths).length;
    spec.paths = Object.fromEntries(
      Object.entries(spec.paths).filter(([path]) => !isPathBlocked(path))
    );
    const filteredPathCount = Object.keys(spec.paths).length;

    console.log(`Filtered ${originalPathCount - filteredPathCount} blocked endpoints (${filteredPathCount} remaining)`);

    if (spec.tags) {
      const originalTagCount = spec.tags.length;
      spec.tags = spec.tags.filter(
        (tag: { name: string }) => !BLOCKED_TAGS.includes(tag.name)
      );
      console.log(`Filtered ${originalTagCount - spec.tags.length} blocked tags`);
    }

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(spec, null, 2) + "\n");
    console.log(`Written to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("Failed to sync OpenAPI spec:", error);
    process.exit(1);
  }
}

void main();
