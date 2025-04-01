#!/usr/bin/env node

/**
 * Script to update competition data in the JSON config file
 * Usage: node update-competition.js <competition-id> <field> <value>
 * Example: node update-competition.js alpha-wave status "CLOSED"
 */

const fs = require('fs');
const path = require('path');

// Get arguments
const competitionId = process.argv[2];
const field = process.argv[3];
const value = process.argv[4];

if (!competitionId || !field || !value) {
  console.error('Missing required arguments');
  console.log('Usage: node update-competition.js <competition-id> <field> <value>');
  console.log('Example: node update-competition.js alpha-wave status "CLOSED"');
  process.exit(1);
}

// Path to the competitions config file
const configPath = path.join(__dirname, '..', 'config', 'competitions.json');

// Read the current config
let config;
try {
  const configData = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configData);
} catch (error) {
  console.error('Error reading config file:', error.message);
  process.exit(1);
}

// Find the competition
const competitionIndex = config.competitions.findIndex(comp => comp.id === competitionId);
if (competitionIndex === -1) {
  console.error(`Competition with ID ${competitionId} not found`);
  process.exit(1);
}

// Update the field
const oldValue = config.competitions[competitionIndex][field];
config.competitions[competitionIndex][field] = value;

// Write back to the file
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  console.log(`Updated ${competitionId}.${field} from "${oldValue}" to "${value}"`);
} catch (error) {
  console.error('Error writing config file:', error.message);
  process.exit(1);
}

// Display the updated competition
console.log('\nUpdated competition data:');
console.log(JSON.stringify(config.competitions[competitionIndex], null, 2));