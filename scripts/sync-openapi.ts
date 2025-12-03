import "dotenv/config";
import * as fs from "fs/promises";
import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIV3 } from "openapi-types";

const SOURCE_URL = process.env.OPENAPI_SOURCE_URL;
const OUTPUT_PATH = "specs/competitions.json";

const BLOCKED_TAGS = ["Admin", "User", "NFL"];

function hasBlockedTag(operation: OpenAPIV3.OperationObject): boolean {
  return operation.tags?.some((tag) => BLOCKED_TAGS.includes(tag)) ?? false;
}

function filterPathItem(
  pathItem: OpenAPIV3.PathItemObject
): OpenAPIV3.PathItemObject | null {
  const httpMethods = [
    "get",
    "put",
    "post",
    "delete",
    "options",
    "head",
    "patch",
    "trace",
  ] as const;

  const filtered: OpenAPIV3.PathItemObject = {};

  for (const method of httpMethods) {
    const operation = pathItem[method];
    if (operation && !hasBlockedTag(operation)) {
      filtered[method] = operation;
    }
  }

  if (pathItem.parameters) filtered.parameters = pathItem.parameters;
  if (pathItem.summary) filtered.summary = pathItem.summary;
  if (pathItem.description) filtered.description = pathItem.description;
  if (pathItem.servers) filtered.servers = pathItem.servers;

  const hasOperations = httpMethods.some((m) => filtered[m]);
  return hasOperations ? filtered : null;
}

async function main(): Promise<void> {
  try {
    if (!SOURCE_URL) {
      throw new Error("OPENAPI_SOURCE_URL environment variable is required");
    }

    console.log(`Fetching OpenAPI spec from ${SOURCE_URL}...`);
    const spec = (await SwaggerParser.bundle(SOURCE_URL)) as OpenAPIV3.Document;

    const originalPathCount = Object.keys(spec.paths ?? {}).length;
    const filteredPaths: OpenAPIV3.PathsObject = {};

    for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
      if (!pathItem) continue;
      const filtered = filterPathItem(pathItem);
      if (filtered) {
        filteredPaths[path] = filtered;
      }
    }

    spec.paths = filteredPaths;
    const filteredPathCount = Object.keys(filteredPaths).length;
    console.log(
      `Filtered ${originalPathCount - filteredPathCount} paths (${filteredPathCount} remaining)`
    );

    if (spec.tags) {
      const originalTagCount = spec.tags.length;
      spec.tags = spec.tags.filter((tag) => !BLOCKED_TAGS.includes(tag.name));
      console.log(
        `Filtered ${originalTagCount - spec.tags.length} blocked tags`
      );
    }

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(spec, null, 2) + "\n");
    console.log(`Written to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("Failed to sync OpenAPI spec:", error);
    process.exit(1);
  }
}

void main();
