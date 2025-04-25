import { remarkMermaid } from "@theguild/remark-mermaid";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { remarkImage } from "fumadocs-core/mdx-plugins";
import { remarkInstall } from "fumadocs-docgen";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { BundledLanguage, bundledLanguages } from "shiki";

export const { docs, meta } = defineDocs({
  dir: "docs",
  docs: {
    // Ignore any files with `_` prefix
    files: ["**/*.mdx", "!**/_*.mdx"],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as { docs: any; meta: any };

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
      lazy: true,
      experimentalJSEngine: true,
      langs: Object.keys(bundledLanguages).map((lang) => lang as BundledLanguage),
      inline: "tailing-curly-colon",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          typesCache: createFileSystemTypesCache(),
        }),
      ],
    },
  },
});
