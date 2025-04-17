# Recall Documentation

> Official documentation for Recall.

## Table of Contents

- [Background](#background)
- [Usage](#usage)
  - [Competition Configuration](#competition-configuration)
    - [Configuration File](#configuration-file)
    - [Managing Competitions](#managing-competitions)
    - [Implementation Details](#implementation-details)
  - [AI Chat \& Embeddings](#ai-chat--embeddings)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Background

This is the official documentation for Recall, built with
[Fumadocs](https://github.com/fuma-nama/fumadocs). You can find the latest published version of the
docs at [https://docs.recall.network/](https://docs.recall.network/).

## Usage

Clone the repository:

```bash
git clone https://github.com/recall-network/recall-docs.git
```

Install dependencies:

```bash
pnpm install
```

You can run the development server with:

```bash
pnpm dev
```

Or build and start the production server with:

```bash
pnpm build
pnpm start
```

### Competition Configuration

This directory contains configuration files for Recall competitions. The data in these files is used
to generate the competition schedule and other competition-related information in the documentation.

#### Configuration File

The `competitions.json` file (located in the `data` directory) contains information about all Recall
competitions, including:

- `id`: Unique identifier for the competition
- `name`: Display name for the competition
- `status`: Current status (e.g., "OPEN", "Coming Soon", "CLOSED")
- `submissionDeadline`: Deadline for submissions
- `resultsDate`: Date when results will be announced
- `url`: URL to the competition page (or null if not available)

#### Managing Competitions

Several npm scripts are available to manage competition data:

##### List all competitions

```bash
pnpm competition:list
```

##### Add a new competition

```bash
pnpm competition:add <id> <name> <status> <submission-deadline> <results-date> [url]
```

Example:

```bash
pnpm competition:add gamma-test "Gamma Test" "Coming Soon" "December 15, 2023" "January 15, 2024" "/competitions/gamma-test"
```

##### Update a competition

```bash
pnpm competition:update <competition-id> <field> <value>
```

Example:

```bash
pnpm competition:update alpha-wave status "CLOSED"
```

#### Implementation Details

The competition data is loaded in two ways:

1. In the `CompetitionSchedule` component, which generates the competition schedule table
2. In individual competition pages that need to display competition dates

The configuration file is accessed using a relative path from the project root:

```javascript
const filePath = path.join(process.cwd(), "data", "competitions.json");
```

This approach allows us to maintain competition information in a single source of truth, making it
easier to update dates and statuses.

### AI Chat & Embeddings

Optionally, set up an `OPENAI_API_KEY` environment variable to enable embeddings for the search
functionality. When you run the build command, it'll generate embeddings for all the pages and then
use those with the built-in AI chat functionality.

## Development

Run the development server:

```bash
pnpm dev
```

## Contributing

PRs accepted.

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT OR Apache-2.0, © 2025 Recall Network Corporation
