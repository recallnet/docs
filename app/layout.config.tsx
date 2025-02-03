import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  links: [
    {
      type: "menu",
      text: "Getting started",
      items: [
        {
          text: "What is Recall?",
          url: "/intro/what-is-recall",
        },
      ],
    },
    {
      type: "menu",
      text: "Protocol",
      items: [
        {
          text: "Architecture ",
          url: "/architecture",
        },
      ],
    },
    {
      type: "menu",
      text: "Services",
      items: [
        {
          text: "Ceramic",
          url: "/ceramic",
        },
        {
          text: "Databases",
          url: "/databases",
        },
      ],
    },
    // External links
    {
      external: true,
      text: "Studio",
      description: "Studio",
      url: "https://studio.recall.network",
    },
    {
      external: true,
      text: "Explorer",
      url: "https://explorer.testnet.recall.network",
    },
    {
      type: "icon",
      external: true,
      text: "X",
      icon: <FaXTwitter />,
      url: "https://x.com/recallnet",
    },
    {
      type: "icon",
      external: true,
      text: "GitHub",
      icon: <FaGithub />,
      url: "https://github.com/recallnet",
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
