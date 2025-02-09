import Image from "next/image";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

import type { BaseLayoutProps } from "@/components/theme/shared";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  links: [
    // {
    //   type: "menu",
    //   text: "Get started",
    //   items: [
    //     {
    //       text: "Introduction",
    //       url: "/intro",
    //     },
    //   ],
    // },
    // External links
    {
      external: true,
      text: "Portal",
      description: "Portal",
      url: "https://portal.recall.network",
      position: "right",
    },
    {
      external: true,
      text: "Faucet",
      description: "Faucet",
      url: "https://faucet.recall.network",
      position: "right",
    },
    {
      external: true,
      text: "Explorer",
      url: "https://explorer.testnet.recall.network",
      position: "right",
    },
    {
      type: "icon",
      external: true,
      text: "X / Twitter",
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
            width={100}
            src="/img/recall-light.svg"
          />
          <span className="ml-1 text-2xl">Docs</span>
        </div>
        <div data-hide-on-theme="light" className="flex items-center gap-2">
          <Image
            alt="Recall"
            className="theme-dark"
            height={22}
            width={100}
            src="/img/recall-dark.svg"
          />
          <span className="ml-1 text-2xl">Docs</span>
        </div>
      </>
    ),
  },
};
