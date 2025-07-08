#!/usr/bin/env tsx
import { remark } from "remark";
import lint from "remark-lint";
import mdx from "remark-mdx";
import { glob } from "glob";
import { readFileSync } from "fs";
import sentenceCase from "../tools/remark-lint-heading-sentence-case";

async function lintFiles() {
  const processor = remark()
    .use(mdx) // parse .mdx
    .use(lint) // enable linting
    .use(sentenceCase); // our custom sentence‑case rule

  const files = await glob("docs/**/*.{md,mdx}");
  let hasErrors = false;
  let totalErrors = 0;

  for (const file of files) {
    try {
      const content = readFileSync(file, "utf8");
      const result = await processor.process({ value: content, path: file });
      
      if (result.messages.length > 0) {
        hasErrors = true;
        console.log(`\n${file}`);
        
        result.messages.forEach(message => {
          totalErrors++;
          const line = message.line ? `:${message.line}` : "";
          const column = message.column ? `:${message.column}` : "";
          const level = message.fatal ? "error" : "warning";
          console.log(`  ${line}${column} ${level} ${message.reason}`);
        });
      } else {
        console.log(`${file}: no issues found`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.log(`\n✖ ${totalErrors} issues found`);
    process.exit(1);
  } else {
    console.log("\n✓ All files passed linting");
  }
}

lintFiles().catch(console.error); 