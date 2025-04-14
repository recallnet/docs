import { remarkMermaid } from "@theguild/remark-mermaid";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { remarkImage } from "fumadocs-core/mdx-plugins";
import { remarkInstall } from "fumadocs-docgen";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

export const { docs, meta }: ReturnType<typeof defineDocs> = defineDocs({
  dir: "docs",
  docs: {
    // Ignore any files with `_` prefix
    files: ["**/*.mdx", "!**/_*.mdx"],
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      remarkMath,
      remarkMermaid,
      [
        remarkInstall,
        {
          persist: {
            id: "package-install",
          },
        },
      ],
      [remarkImage, { useImport: true, publicDir: "public" }],
    ],
    rehypePlugins: (v) => [rehypeKatex, ...v],
    rehypeCodeOptions: {
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash()],
    },
  },
});
