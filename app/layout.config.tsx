import { Link as LinkIcon, PartyPopper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6";

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
      text: "Discord",
      icon: <FaDiscord />,
      url: "http://discord.recall.network",
    },
    {
      type: "icon",
      external: true,
      text: "GitHub",
      icon: <FaGithub />,
      url: "https://github.com/recallnet",
    },
  ],
  banner: {
    id: "competition-banner",
    variant: "rainbow",
    children: (
      <>
        <Link
          href="https://hhueol4i6vp.typeform.com/to/I84sAGZ4"
          target="_blank"
          className="text-fd-primary hover:text-fd-primary/80 inline-flex items-center font-bold transition-colors duration-200"
        >
          <PartyPopper size={16} className="mr-2" />
          Join the AlphaWave competition
          <LinkIcon size={16} className="ml-1" />
        </Link>
      </>
    ),
  },
  nav: {
    title: (
      <>
        <div data-hide-on-theme="dark" className="flex items-center gap-2">
          <Image
            alt="Recall"
            className="theme-light h-[30px] w-[100px]" // Updated
            height={30}
            width={100}
            src="/img/recall-light.svg"
          />
          <span className="ml-1 text-2xl">Docs</span>
        </div>
        <div data-hide-on-theme="light" className="flex items-center gap-2">
          <Image
            alt="Recall"
            className="theme-dark h-[30px] w-[100px]" // Updated
            height={30}
            width={100}
            src="/img/recall-dark.svg"
          />
          <span className="ml-1 text-2xl">Docs</span>
        </div>
      </>
    ),
  },
};
