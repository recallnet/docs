import {
  ArrowRight,
  BookOpen,
  Database,
  MemoryStick,
  Network,
  Plug2,
  Timer,
  Zap,
} from "lucide-react";

import { Card } from "@/components/theme/card";
import { buttonVariants } from "@/components/theme/ui/button";
import { cn } from "@/lib/theme/cn";

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Extensible",
    description:
      "Build dynamic intelligence for your agents with data storage, function triggers, and verifiable execution",
  },
  {
    icon: <MemoryStick className="h-6 w-6" />,
    title: "Memory APIs",
    description:
      "Purpose-built memory and Chain-of-Thought workflows with simple, drop-in plugins across agent frameworks",
  },
  {
    icon: <Network className="h-6 w-6" />,
    title: "Scalable & reliable",
    description:
      "Powered by blockchain subnets designed from the ground up for AI agents—with native data availability",
  },
];

const quickstartCards = [
  {
    title: "Introduction",
    icon: <BookOpen className="text-purple h-5 w-5" />,
    href: "/intro/what-is-recall",
    description: "Learn about Recall's core concepts and architecture",
  },
  {
    title: "Plugins",
    icon: <Plug2 className="text-purple h-5 w-5" />,
    href: "/plugins",
    description: "Store and manage data with easy to use plugins",
  },
  {
    title: "SDKs",
    icon: <Timer className="text-purple h-5 w-5" />,
    href: "/sdk",
    description: "Build agents with the TypeScript or Rust SDKs",
  },
  {
    title: "Services",
    icon: <Database className="text-purple h-5 w-5" />,
    href: "/ceramic",
    description: "Event streaming and databases for your agents",
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
              Build agents with <span className="text-purple font-extrabold">intelligent </span>
              <span className="text-purple font-extrabold">memory</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Recall is an intelligence network that enables agents to verifiably{" "}
              <span className="text-primary font-bold">store</span>,{" "}
              <span className="text-primary font-bold">access</span>, and{" "}
              <span className="text-primary font-bold">exchange memory</span>.
              <br />
              <br />
              Make agents smarter with{" "}
              <span className="text-primary font-bold">programmable data</span> and multi-agent
              coordination, supercharging their abilities.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="/intro/what-is-recall"
                className={cn(
                  buttonVariants({
                    color: "secondary",
                  }),
                  "text-md p-4 font-bold no-underline transition-all duration-100"
                )}
              >
                <span className="text-md mr-1">Get started</span>
                <ArrowRight className="size-4" />
              </a>
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
                  descriptionClassName="text-md"
                  key={index}
                  className={cn(
                    "bg-fd-card floating-item rounded-lg border p-4 transition-transform",
                    index % 2 === 0
                      ? "[--x-offset:2px] [--y-offset:-2px]"
                      : "[--x-offset:-2px] [--y-offset:2px] lg:translate-x-6"
                  )}
                  icon={<div className="text-purple bg-fd-card mb-2">{feature.icon}</div>}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="rounded-lg p-8">
        <h2 className="text-2xl font-bold">Quickstart</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickstartCards.map((card, index) => (
            <Card
              key={index}
              className="bg-secondary hover:bg-secondary/90 rounded-lg border p-4 no-underline transition-all duration-100"
              title={card.title}
              titleClassName="text-md pt-1"
              icon={card.icon}
              href={card.href}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
