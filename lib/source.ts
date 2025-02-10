import { type LoaderConfig, type LoaderOutput, loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";
import { icons as lucideIcons } from "lucide-react";
import { createElement } from "react";
import * as faIcons from "react-icons/fa6";

import { docs, meta } from "@/.source";

export const source: LoaderOutput<LoaderConfig> = loader({
  baseUrl: "/",
  source: createMDXSource(docs, meta),
  icon(icon) {
    if (!icon) {
      // Optional: default icon
      return;
    }
    if (icon in lucideIcons) return createElement(lucideIcons[icon as keyof typeof lucideIcons]);
    if (icon in faIcons) return createElement(faIcons[icon as keyof typeof faIcons]);
  },
});
