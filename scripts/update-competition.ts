#!/usr/bin/env node
/**
 * Script to update competition data in the JSON config file
 * Usage: node update-competition.js <competition-id> <field> <value>
 * Example: node update-competition.js alpha-wave status "CLOSED"
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Competition } from "@/lib/competitions";

// Get arguments
const competitionId = process.argv[2];
const field = process.argv[3];
const value = process.argv[4];

if (!competitionId || !field || !value) {
  console.error("Missing required arguments");
  console.log("Usage: npx tsx update-competition.ts <competition-id> <field> <value>");
  console.log('Example: npx tsx update-competition.ts alpha-wave status "CLOSED"');
  process.exit(1);
}

// Path to the competitions config file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "..", "app", "data", "competitions.json");

// Read the current config
let config;
try {
  const configData = await fs.readFile(configPath, "utf8");
  config = JSON.parse(configData);
} catch (error) {
  console.error(
    "Error reading config file:",
    error instanceof Error ? error.message : "Unknown error"
  );
  process.exit(1);
}

// Find the competition
const competitionIndex = config.competitions.findIndex(
  (comp: Competition) => comp.id === competitionId
);
if (competitionIndex === -1) {
  console.error(`Competition with ID ${competitionId} not found`);
  process.exit(1);
}

// Update the field
const oldValue = config.competitions[competitionIndex][field];
config.competitions[competitionIndex][field] = value;

// Write back to the file
try {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  console.log(`Updated ${competitionId}.${field} from "${oldValue}" to "${value}"`);
} catch (error) {
  console.error(
    "Error writing config file:",
    error instanceof Error ? error.message : "Unknown error"
  );
  process.exit(1);
}

// Display the updated competition
console.log("\nUpdated competition data:");
console.log(JSON.stringify(config.competitions[competitionIndex], null, 2));
