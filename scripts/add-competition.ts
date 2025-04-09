#!/usr/bin/env node
/**
 * Script to add a new competition to the JSON config file
 * Usage: node add-competition.js <id> <name> <status> <submission-deadline> <results-date> <url>
 * Example: node add-competition.js gamma-test "Gamma Test" "Coming Soon" "December 15, 2023" "January 15, 2024" "/competitions/gamma-test"
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Competition } from "@/lib/competitions";

// Get arguments
const id = process.argv[2];
const name = process.argv[3];
const status = process.argv[4];
const submissionDeadline = process.argv[5];
const resultsDate = process.argv[6];
const url = process.argv[7] || null;

if (!id || !name || !status || !submissionDeadline || !resultsDate) {
  console.error("Missing required arguments");
  console.log(
    "Usage: npx tsx add-competition.ts <id> <name> <status> <submission-deadline> <results-date> <url>"
  );
  console.log(
    'Example: npx tsx add-competition.ts gamma-test "Gamma Test" "Coming Soon" "December 15, 2023" "January 15, 2024" "/competitions/gamma-test"'
  );
  process.exit(1);
}

// Path to the competitions config file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "..", "config", "competitions.json");

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

// Check if competition already exists
const existingComp = config.competitions.find((comp: Competition) => comp.id === id);
if (existingComp) {
  console.error(`Competition with ID ${id} already exists`);
  process.exit(1);
}

// Create the new competition
const newCompetition = {
  id,
  name,
  status,
  submissionDeadline,
  resultsDate,
  url,
};

// Add it to the config
config.competitions.push(newCompetition);

// Write back to the file
try {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  console.log(`Added new competition: ${name}`);
} catch (error) {
  console.error(
    "Error writing config file:",
    error instanceof Error ? error.message : "Unknown error"
  );
  process.exit(1);
}

// Display the updated competitions list
console.log("\nCompetitions list:");
config.competitions.forEach((comp: Competition, index: number) => {
  console.log(`${index + 1}. ${comp.name} (${comp.id}) - ${comp.status}`);
});
