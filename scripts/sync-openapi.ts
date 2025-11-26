import fs from "fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/recallnet/js-recall/main/apps/api/openapi/openapi.json";
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
  console.log(`Fetching OpenAPI spec from ${SOURCE_URL}...`);

  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const spec = await response.json();

  const originalPaths = Object.keys(spec.paths);
  const filteredPaths: Record<string, unknown> = {};

  for (const [path, value] of Object.entries(spec.paths)) {
    if (!isPathBlocked(path)) {
      filteredPaths[path] = value;
    }
  }

  spec.paths = filteredPaths;

  const removedPathCount = originalPaths.length - Object.keys(filteredPaths).length;
  console.log(`Filtered ${removedPathCount} blocked endpoints (${Object.keys(filteredPaths).length} remaining)`);

  if (spec.tags) {
    const originalTagCount = spec.tags.length;
    spec.tags = spec.tags.filter(
      (tag: { name: string }) => !BLOCKED_TAGS.includes(tag.name)
    );
    console.log(`Filtered ${originalTagCount - spec.tags.length} blocked tags`);
  }

  spec.components ??= {};
  spec.components.securitySchemes ??= {};

  // Upstream uses AgentApiKey in /api/auth/* endpoints but doesn't define it.
  // Inject the definition if missing. Remove this block once upstream defines AgentApiKey.
  if (!spec.components.securitySchemes.AgentApiKey) {
    spec.components.securitySchemes.AgentApiKey = {
      type: "http",
      scheme: "bearer",
      description: "Agent API key provided as Bearer token",
    };
    console.log("Injected missing AgentApiKey security scheme");
  }

  // Upstream uses bearerAuth (lowercase) in some endpoints but doesn't define it.
  // Inject the definition if missing. Remove this block once upstream defines bearerAuth.
  if (!spec.components.securitySchemes.bearerAuth) {
    spec.components.securitySchemes.bearerAuth = {
      type: "http",
      scheme: "bearer",
      description: "Bearer token authentication",
    };
    console.log("Injected missing bearerAuth security scheme");
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(spec, null, 2) + "\n");
  console.log(`Written to ${OUTPUT_PATH}`);
}

void main();
