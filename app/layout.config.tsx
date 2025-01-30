import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { FaXTwitter } from "react-icons/fa6";
/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    // can be JSX too!
    enabled: true,
    title: "Docs",
  },
  githubUrl: "https://github.com/recallnet",
  links: [
    {
      text: "Home",
      url: "/",
      active: "nested-url",
    },
    {
      type: "icon",
      text: "X",
      icon: <FaXTwitter />,
      url: "https://x.com/recallnet",
    },
  ],
};
