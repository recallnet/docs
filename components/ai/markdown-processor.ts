import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { Root } from "hast";
import { type Components, toJsxRuntime } from "hast-util-to-jsx-runtime";
import { type ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import { createHighlighter } from "shiki/bundle/web";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

interface MetaValue {
  name: string;
  regex: RegExp;
}

/**
 * Custom meta string values
 */
const metaValues: MetaValue[] = [
  {
    name: "title",
    regex: /title="(?<value>[^"]*)"/,
  },
];

export interface Processor {
  process: (content: string, components: Partial<Components>) => Promise<ReactNode>;
}

export function createProcessor(): Processor {
  function filterMetaString(meta: string): string {
    let replaced = meta;
    for (const value of metaValues) {
      replaced = replaced.replace(value.regex, "");
    }

    return replaced;
  }

  const themes = {
    light: "vitesse-light",
    dark: "vitesse-dark",
  };

  const rehypeShiki = createHighlighter({
    langs: [
      import("@shikijs/langs-precompiled/typescript"),
      import("@shikijs/langs-precompiled/javascript"),
      import("@shikijs/langs-precompiled/rust"),
      import("@shikijs/langs-precompiled/python"),
      import("@shikijs/langs-precompiled/bash"),
      import("@shikijs/langs-precompiled/css"),
      import("@shikijs/langs-precompiled/html"),
      import("@shikijs/langs-precompiled/json"),
      import("@shikijs/langs-precompiled/markdown"),
      import("@shikijs/langs-precompiled/yaml"),
      import("@shikijs/langs-precompiled/toml"),
      import("@shikijs/langs-precompiled/jsx"),
      import("@shikijs/langs-precompiled/tsx"),
      import("@shikijs/langs-precompiled/json"),
    ],
    themes: Object.values(themes),
    engine: createJavaScriptRegexEngine(),
  }).then((highlighter) => {
    return rehypeShikiFromHighlighter(highlighter, {
      defaultLanguage: "text",
      defaultColor: false,
      themes,
      lazy: true,
      parseMetaString(meta) {
        const map: Record<string, string> = {};

        for (const value of metaValues) {
          const result = value.regex.exec(meta);

          if (result) {
            map[value.name] = result[1] ?? "";
          }
        }

        return map;
      },
      transformers: [
        {
          name: "pre-process",
          line(hast) {
            if (hast.children.length === 0) {
              // Keep the empty lines when using grid layout
              hast.children.push({
                type: "text",
                value: " ",
              });
            }
          },
          preprocess(_, { meta }) {
            if (meta) {
              meta.__raw = filterMetaString(meta.__raw ?? "");
            }
          },
        },
      ],
    });
  });

  const processor = remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      footnoteLabel: "Footnotes",
      footnoteBackLabel: "Back to content",
    })
    .use(rehypeKatex)
    .use(() => {
      return async (tree: Root, file) => {
        const transformer = await rehypeShiki;
        return transformer(tree, file, () => {
          // do nothing
        }) as Root;
      };
    });

  return {
    async process(content, components) {
      const normalizedContent = content
        // Ensure proper spacing after list items with colons
        .replace(/(\d+\.\s+[^:\n]+):\s*```/g, "$1:\n\n```")
        // Ensure proper spacing after bold/emphasized list items with colons
        .replace(/(\d+\.\s+\*\*[^:\n]+\*\*):\s*```/g, "$1:\n\n```")
        // Clean up excessive newlines
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      const nodes = processor.parse({ value: normalizedContent });
      const hast = await processor.run(nodes);
      return toJsxRuntime(hast, {
        development: false,
        jsx,
        jsxs,
        Fragment,
        components,
      });
    },
  };
}
