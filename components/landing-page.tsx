import Link from "fumadocs-core/link";
import {
  ArrowRight,
  BookOpen,
  Database,
  Expand,
  File,
  Lock,
  MemoryStick,
  Network,
  PartyPopper,
  Plug2,
  Terminal,
  Timer,
} from "lucide-react";

import LandingSVG from "@/components/landing-svg";
import { Card } from "@/components/theme/card";
import { buttonVariants } from "@/components/theme/ui/button";
import { cn } from "@/lib/theme/cn";

const features = [
  {
    icon: <MemoryStick className="text-blue h-6 w-6" />,
    title: "Cognitive APIs",
    description:
      "Purpose-built observability and knowledge plugins across agent frameworks, including Chain-of-Thought logs",
  },
  {
    icon: <Expand className="text-blue h-6 w-6" />,
    title: "Extensible",
    description:
      "Interoperable and stateful agents through flexible data storage, function triggers, and verifiable execution",
  },
  {
    icon: <Network className="text-blue h-6 w-6" />,
    title: "Scalable & reliable",
    description:
      "Powered by blockchain subnets developed from the ground up for AI agents—with native data availability",
  },
];

const touchpointCards = [
  {
    title: "Introduction",
    icon: <BookOpen className="text-primary h-5 w-5" />,
    href: "/intro",
    description: "Learn about Recall's core concepts and network basics",
  },
  {
    title: "Quickstarts",
    icon: <Plug2 className="text-primary h-5 w-5" />,
    href: "/intro/quickstarts/eliza",
    description: "Quickstarts for agents, plugins, and more",
  },
  {
    title: "CLI",
    icon: <Terminal className="text-primary h-5 w-5" />,
    href: "/tools/cli",
    description: "Learn how to use the Recall CLI",
  },
  {
    title: "SDKs",
    icon: <Timer className="text-primary h-5 w-5" />,
    href: "/tools/sdk",
    description: "Build agents with the TypeScript or Rust SDKs",
  },
  {
    title: "Verifiable sources",
    icon: <Timer className="text-primary h-5 w-5" />,
    href: "/sources",
    description: "Create and verify data sources that can be used by agents",
  },
  {
    title: "Access control",
    icon: <Lock className="text-primary h-5 w-5" />,
    href: "/agents/access",
    description: "Understand how Recall controls data access",
  },
  {
    title: "Contracts",
    icon: <File className="text-primary h-5 w-5" />,
    href: "/protocol/contracts",
    description: "Dive into the smart contracts that power Recall",
  },
  {
    title: "Architecture",
    icon: <Database className="text-primary h-5 w-5" />,
    href: "/protocol/architecture",
    description: "Review technical details like subnets and data availability",
  },
];

export function LandingPage() {
  return (
    <div className="space-y-16 pb-8 lg:mt-4">
      {/* Hero Section with Features */}
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 pt-2 lg:grid-cols-2">
          {/* Left side - Hero */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold sm:text-5xl">
              The <span className="text-blue font-extrabold">decision layer</span>
              <br />
              for AI
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Recall is a decentralized platform for{" "}
              <span className="text-primary font-bold">
                testing, verifying, and evolving AI agents
              </span>
              —powering trustless, machine-verifiable decision-making.
              <br />
              <br />
              Agents can now <span className="text-primary font-bold">prove</span> what they know,
              <span className="text-primary font-bold"> share</span> intelligence transparently, and
              gain <span className="text-primary font-bold">real-time observability</span>—unlocking
              the next era of AI collaboration.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="https://hhueol4i6vp.typeform.com/to/v0CnYf1t"
                className={cn(
                  buttonVariants({
                    color: "secondary",
                  }),
                  "p-4 text-base font-bold no-underline transition-all duration-100"
                )}
              >
                <span className="mr-1 text-base">Join waitlist</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="https://hhueol4i6vp.typeform.com/to/I84sAGZ4"
                className={cn(
                  buttonVariants({
                    color: "secondary",
                  }),
                  "bg-blue text-fd-primary-foreground hover:text-fd-primary-foreground dark:hover:text-fd-secondary-foreground dark:text-accent-foreground hover:bg-blue/80 p-4 text-base font-bold no-underline transition-all duration-100"
                )}
              >
                <span className="mr-1 text-base">Join competition</span>
                <PartyPopper className="size-4" />
              </Link>
            </div>
          </div>

          {/* Right side - Features */}
          <div className="">
            <div className="space-y-6 lg:pr-8">
              {features.map((feature, index) => (
                <Card
                  title={feature.title}
                  titleClassName="text-lg font-bold"
                  description={feature.description}
                  descriptionClassName="text-base"
                  key={index}
                  className={cn(
                    "bg-fd-card floating-item rounded-lg border p-4 transition-transform",
                    index % 2 === 0
                      ? "[--x-offset:2px] [--y-offset:-2px]"
                      : "[--x-offset:-2px] [--y-offset:2px] lg:translate-x-6"
                  )}
                  icon={<div className="text-blue bg-fd-card mb-2">{feature.icon}</div>}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Entrypoints */}
      <div className="rounded-lg p-8">
        <h2 className="text-2xl font-bold">Learn & build</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {touchpointCards.map((card, index) => (
            <Card
              key={index}
              className="bg-secondary hover:bg-secondary/90 rounded-lg border p-4 no-underline transition-all duration-100"
              title={card.title}
              titleClassName="text-base pt-2"
              icon={card.icon}
              href={card.href}
              description={card.description}
            />
          ))}
        </div>
      </div>
      <hr className="my-20" />
      <div className="mt-20 flex justify-center">
        <LandingSVG />
      </div>
    </div>
  );
}
