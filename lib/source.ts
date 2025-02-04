import { type LoaderConfig, type LoaderOutput, loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { createElement } from "react";
import * as icons from "react-icons/fa6";

import { docs, meta } from "@/.source";

export const source: LoaderOutput<LoaderConfig> = loader({
  baseUrl: "/",
  source: createMDXSource(docs, meta),
  icon(icon) {
    if (!icon) {
      // Optional: default icon
      return;
    }
    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
  },
});
