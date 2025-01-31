import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { remarkMermaid } from "@theguild/remark-mermaid";
import { transformerTwoslash } from "fumadocs-twoslash";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { remarkInstall } from "fumadocs-docgen";
import { remarkImage } from "fumadocs-core/mdx-plugins";

export const { docs, meta } = defineDocs({
  dir: "docs",
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      remarkMath,
      remarkMermaid,
      remarkInstall,
      [remarkImage, { useImport: true, publicDir: "public" }],
    ],
    rehypePlugins: (v) => [rehypeKatex, ...v],
    rehypeCodeOptions: {
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash(),
      ],
    },
  },
});
