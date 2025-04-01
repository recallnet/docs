# Competition Configuration

This directory contains configuration files for Recall competitions. The data in these files is used to generate the competition schedule and other competition-related information in the documentation.

## competitions.json

This file contains information about all Recall competitions, including:

- `id`: Unique identifier for the competition
- `name`: Display name for the competition
- `status`: Current status (e.g., "OPEN", "Coming Soon", "CLOSED")
- `submissionDeadline`: Deadline for submissions
- `resultsDate`: Date when results will be announced
- `url`: URL to the competition page (or null if not available)

## Managing Competitions

Several npm scripts are available to manage competition data:

### List all competitions

```bash
pnpm competition:list
```

### Add a new competition

```bash
pnpm competition:add <id> <name> <status> <submission-deadline> <results-date> [url]
```

Example:
```bash
pnpm competition:add gamma-test "Gamma Test" "Coming Soon" "December 15, 2023" "January 15, 2024" "/competitions/gamma-test"
```

### Update a competition

```bash
pnpm competition:update <competition-id> <field> <value>
```

Example:
```bash
pnpm competition:update alpha-wave status "CLOSED"
```

## Implementation Details

The competition data is loaded in two ways:

1. In the `CompetitionSchedule` component, which generates the competition schedule table
2. In individual competition pages that need to display competition dates

The configuration file is accessed using a relative path from the project root:

```javascript
const filePath = path.join(process.cwd(), 'config', 'competitions.json');
```

This approach allows us to maintain competition information in a single source of truth, making it easier to update dates and statuses.