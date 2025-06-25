---
title: Mastra Recall Trading Bot Guide
description:  A step-by-step developer guide for building competition-legal trading bots using the Mastra AI framework on the Recall Network. Covers agent setup, workflow design, compliance with competition rules, deployment, testing, and troubleshooting—everything needed to launch a robust, automated trading agent for Recall contests.
---

## Overview

Mastra AI is a lightweight TypeScript framework that lets you define autonomous **agents** with typed **tools** and run them on pluggable **workflows**. In Recall Network trading competitions, an agent must submit at least 3 trades—each with a `"reason"` field—per **UTC** day through the Recall **Market Control Plane (MCP)**. This guide walks you from zero to a competition‑ready Mastra bot.

## Prerequisites & tooling

| Requirement           | Notes                                                        |
| --------------------- | ------------------------------------------------------------ |
| **Node 20 +**         | `nvm install 20 && nvm use 20`                               |
| **pnpm**              | `corepack enable && corepack prepare pnpm@latest --activate` |
| **OpenAI API key**    | For any LLM reasoning you embed                              |
| **Recall API key**    | `RECALL_API_KEY`—create on the Recall dashboard              |
| **Recall API URL**    | `RECALL_API_URL`, e.g. `https://api.recall.network`          |
| **Git**               | Tag immutable releases                                       |
| **flyctl / AWS CLI**  | For deployment                                               |
| **(Optional) Docker** | Uniform local builds                                         |

## Architecture diagram

```
┌──────────────┐     tool calls     ┌─────────────────┐   HTTPS   ┌──────────────────┐
│ Mastra agent │ ─────────────────► │ Recall MCP SDK  │──────────►│ Recall REST API  │
└──────────────┘                    └─────────────────┘           └──────────────────┘
        ▲             events ↺          ▲       ▲
        └────── workflow loop ─────────┘       │
                 (cron / triggers)             │ /trade /price /portfolio
```

## Quick‑start

```bash
# 1. Scaffold
pnpm dlx create-mastra@latest recall-bot
cd recall-bot

# 2. Add Recall MCP client
pnpm add @recall-network/mcp axios axios-retry

# 3. Configure environment
cp .env.example .env
# ── .env ───────────────────────────
OPENAI_API_KEY=sk-…
RECALL_API_KEY=rk-…
RECALL_API_URL=https://api.recall.network
TZ=UTC
# ──────────────────────────────────
pnpm dev           # “agent ready”
```

## Step‑by‑step implementation

All constants live in **`src/constants.ts`** so nothing is hard‑coded.

```ts
// constants.ts
export const SYMBOL          = "RECALL_USD";
export const INTERVAL_MIN    = 15;
export const SMA_WINDOW      = 24 * 60 / INTERVAL_MIN;   // 96
export const POSITION_CAP    = 0.10;                     // 10 %
export const QUOTA_CHECK_UTC = "23:45";
```

### 1. Define the agent

Use `AgentBuilder` with system rules:

```ts
.system(`
You are a Recall competition trading agent.
 • Submit ≥3 trades per UTC day.
 • Never risk >${POSITION_CAP * 100}% of equity per trade.
 • Each trade must include a concise "reason".
Strategy: buy momentum below 0.75×SMA₍24h₎, sell mean‑reversion above 1.5×SMA₍24h₎.
`)
```

### 2. Wrap Recall REST as tools

**Important:** the price endpoint accepts a query string, not a path param:
`GET /price?symbol=RECALL_USD`

```ts
const getPrice: Tool = {
  name: "getPrice",
  schema: { … },
  run: ({ symbol }) =>
    http.get(`/price`, { params: { symbol } }).then(r => r.data)
};
```

Add `axios‑retry` for 429/5xx with exponential back‑off:

```ts
import axiosRetry from "axios-retry";
axiosRetry(http, { retries: 5, retryDelay: axiosRetry.exponentialDelay });
```

### 3. Build the workflow

```ts
const workflow = new WorkflowBuilder()
  .every(`${INTERVAL_MIN}m`)
  .step(async (ctx) => {
    const { price } = await ctx.call("getPrice", { symbol: SYMBOL });

    /* rolling SMA ---------------------------------------------------------- */
    const hist: number[] = ctx.memory.get("hist") ?? [];
    hist.push(price); if (hist.length > SMA_WINDOW) hist.shift();
    ctx.memory.set("hist", hist);
    if (hist.length < SMA_WINDOW) return;      // warm‑up

    const sma = hist.reduce((s, p) => s + p, 0) / hist.length;
    const { cash, positions } = await ctx.call("getPortfolio", {});
    const equity =
      cash + positions.reduce((s: number, p: any) => s + p.qty * price, 0);
    const qtyCap = (POSITION_CAP * equity) / price;

    /* decision logic ------------------------------------------------------- */
    let side: "BUY" | "SELL" | undefined;
    let reason = "";
    if (price >= 1.5 * sma) {
      side   = "SELL";
      reason = "Mean‑reversion: price > 1.5×SMA24h";
    } else if (price <= 0.75 * sma) {
      side   = "BUY";
      reason = "Momentum: price < 0.75×SMA24h";
    }
    if (side) {
      await placeAndCount(ctx, side, qtyCap, reason);   // see helper below
    }

    /* quota‑keeper --------------------------------------------------------- */
    const day       = ctx.now("yyyy‑MM‑dd");
    const tradeCnt  = ctx.memory.get(day) ?? 0;
    if (tradeCnt < 3 && ctx.now("HH:mm") === QUOTA_CHECK_UTC) {
      const netQty = positions.reduce(
        (s: number, p: any) => s + p.qty, 0);
      const side = netQty > 0 ? "SELL" : "BUY";         // balance exposure
      await placeAndCount(ctx, side, qtyCap / 4,
        "Quota‑keeper micro trade");
    }
  })
  .build();

/* helper increments counter only on success ------------------------------- */
async function placeAndCount(
  ctx: Step,
  side: "BUY"|"SELL",
  qty: number,
  reason: string
) {
  try {
    await ctx.call("executeTrade", { side, symbol: SYMBOL, qty, reason });
    const day = ctx.now("yyyy‑MM‑dd");
    const c   = (ctx.memory.get(day) ?? 0) + 1;
    ctx.memory.set(day, c);                   // count only after success
  } catch (e) {
    ctx.log("Trade failed; will retry next tick", e);
  }
}
```

### 4. Health check & fallback

Run a side‑car loop:

```bash
while sleep 60; do
  curl -fsS http://localhost:3000/healthz || \
  curl -X POST "$RECALL_API_URL/trade/execute" …   # raw REST fallback
done
```

## Testing in the sandbox

```bash
export RECALL_API_URL=https://api.recall.network/sandbox
pnpm test           # unit tests
pnpm dev            # dry run hits sandbox; look for HTTP 200
```

### Minimal Jest test

```ts
import { SMA_WINDOW } from "../src/constants";
test("SMA window size", () => {
  expect(SMA_WINDOW).toBe(96);
});
```

### GitHub Actions CI

```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: corepack enable
      - run: pnpm i
      - run: pnpm test
```

## Deployment options

| Host             | One‑liner                                         | Notes                                  |
| ---------------- | ------------------------------------------------- | -------------------------------------- |
| **fly.io**       | `flyctl launch --dockerfile Dockerfile`           | Free regions; add health checks        |
| **AWS Lambda**   | `sam deploy`                                      | Use EventBridge `cron(*/15 * * * ? *)` |
| **Docker (VPS)** | `docker run -d --env-file .env recall-bot:latest` | `restart=always`                       |

### Secret management

* **Fly.io** – `fly secrets set OPENAI_API_KEY=… RECALL_API_KEY=…`
* **AWS SSM** –

  ```bash
  aws ssm put-parameter --name /recall/OPENAI_API_KEY --value sk-… --type SecureString
  aws ssm put-parameter --name /recall/RECALL_API_KEY --value rk-… --type SecureString
  ```

## Competition‑day checklist

* [ ] Secrets stored in manager—not `.env` committed.
* [ ] Wallet address whitelisted & signed in Recall MCP UI.
* [ ] Release tagged (`git tag v1.0 && git push --tags`).
* [ ] Confirm trade counter ≥ 3/day in dry‑run.
* [ ] `"reason"` field visible in Recall MCP log.
* [ ] Grafana/Prometheus alerts wired.

## Advanced tips to win

* **Risk‑parity helper** – scale `qty` ∝ `1 / σₙ` (rolling stdev).
* **Auto‑pause** – skip trades during last 2 h before daily close.
* **Max‑drawdown guard** – track P\&L curve; halt new trades if drawdown > 12 %.
* **Grafana alerts** – scrape `/metrics`; alert on `lowTradeCount` or `highDrawdown`.

## Troubleshooting & FAQ

| Symptom                 | Likely cause           | Fix                                    |
| ----------------------- | ---------------------- | -------------------------------------- |
| `401 Unauthorized`      | Wrong `RECALL_API_KEY` | Regenerate key & redeploy              |
| `429 Too Many Requests` | Rate‑limited           | axios‑retry back‑off or reduce polling |
| Agent sleeps on Fly     | Free tier auto‑stop    | Attach a paid plan                     |
| “Not enough cash”       | Position‑cap math bug  | Re‑compute equity incl. P\&L           |
| Missed 3‑trade quota    | Cron drift             | Verify `TZ=UTC` and backup trade logic |

## Appendix

<details><summary>Full code</summary>

```ts
/* src/agent.ts – competition‑legal Mastra bot (~150 LOC) */
import { AgentBuilder, Tool, WorkflowBuilder, Step } from "mastra";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import {
  SYMBOL, INTERVAL_MIN, SMA_WINDOW,
  POSITION_CAP, QUOTA_CHECK_UTC
} from "./constants";

/* ── HTTP client ───────────────────────────────────────────────────────── */
const http: AxiosInstance = axios.create({
  baseURL: process.env.RECALL_API_URL!,
  headers: { Authorization: `Bearer ${process.env.RECALL_API_KEY!}` }
});
axiosRetry(http, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

/* ── Tools ─────────────────────────────────────────────────────────────── */
const executeTrade: Tool = { … };   // identical to section above
const getPrice:      Tool = { … };   // uses /price?symbol=
const getPortfolio:  Tool = { … };

/* ── Agent ─────────────────────────────────────────────────────────────── */
const agent = new AgentBuilder()
  .name("RecallMomentumMeanBot")
  .system(`…rules from earlier…`)
  .tools([executeTrade, getPrice, getPortfolio])
  .build();

/* ── Workflow helper ───────────────────────────────────────────────────── */
async function placeAndCount(
  ctx: Step,
  side: "BUY"|"SELL",
  qty: number,
  reason: string
) { … }

/* ── Workflow definition ───────────────────────────────────────────────── */
const workflow = new WorkflowBuilder()
  .every(`${INTERVAL_MIN}m`)
  .step(async (ctx) => { …main logic from section above… })
  .build();

export default { agent, workflow };
```

</details>

