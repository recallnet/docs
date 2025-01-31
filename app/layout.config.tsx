import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  githubUrl: "https://github.com/recallnet",
  links: [
    {
      text: "Home",
      url: "/",
      active: "nested-url",
    },
    {
      type: "icon",
      external: true,
      text: "X",
      icon: <FaXTwitter />,
      url: "https://x.com/recallnet",
    },
  ],
  nav: {
    title: (
      <>
        <div data-hide-on-theme="dark" className="flex items-center gap-2">
          <Image
            alt="Recall"
            className="theme-light"
            height={22}
            src="/img/recall-light.svg"
            width={100}
          />
          <span className="ml-1 text-2xl font-normal">Docs</span>
        </div>
        <div data-hide-on-theme="light" className="flex items-center gap-2">
          <Image
            alt="Recall"
            className="theme-dark"
            height={22}
            src="/img/recall-dark.svg"
            width={100}
          />
          <span className="ml-1 text-2xl font-normal">Docs</span>
        </div>
      </>
    ),
  },
};
