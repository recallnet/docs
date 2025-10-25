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

PRs are welcome!

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT OR Apache-2.0, © 2025 Recall Network Corporation
