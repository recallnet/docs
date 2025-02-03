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
    title: "Datachain",
    description:
      "Build dynamic memory context for your agents with data storage, function triggers, and verifiable execution",
  },
  {
    icon: <MemoryStick className="h-6 w-6" />,
    title: "Memory API",
    description:
      "Purpose-built memory and Chain-of-Thought workflows with simple, drop-in plugins across agent frameworks",
  },
  {
    icon: <Network className="h-6 w-6" />,
    title: "Scalable & reliable",
    description:
      "Built on decentralized, hierarchical subnets with polyglot execution (EVM + Wasm) and native data availability",
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
    href: "/rust-sdk",
    description: "Store and manage data with easy to use plugins",
  },
  {
    title: "Event Store",
    icon: <Timer className="text-purple h-5 w-5" />,
    href: "/ceramic",
    description: "Handle events and streaming data efficiently",
  },
  {
    title: "Databases",
    icon: <Database className="text-purple h-5 w-5" />,
    href: "/databases",
    description: "Set up and manage your agent's memory stores",
  },
];

export function LandingPage() {
  return (
    <div className="space-y-16 pb-8 lg:mt-4">
      {/* Hero Section with Features */}
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side - Hero */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Build agents with{" "}
              <span className="text-purple">intelligent </span>
              <span className="text-purple font-extrabold italic">memory</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Recall is an intelligence network that enables agents to store,
              access, and trade{" "}
              <span className="text-primary font-bold">memory</span> in a
              verifiable way. Build smarter agents with{" "}
              <span className="text-primary font-bold">programmable data</span>,
              fast consensus, and{" "}
              <span className="text-primary font-bold">scalable storage</span>.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="/intro/what-is-recall"
                className={cn(
                  buttonVariants({
                    color: "secondary",
                  }),
                  "text-md p-4 font-bold no-underline transition-all duration-100",
                )}
              >
                <span className="text-md mr-1">Get started</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          {/* Right side - Features */}
          <div className="overflow-hidden">
            <div className="space-y-6 lg:pr-8">
              {features.map((feature, index) => (
                <Card
                  title={feature.title}
                  titleClassName="text-lg font-bold"
                  description={feature.description}
                  descriptionClassName="text-md"
                  key={index}
                  className={cn(
                    "bg-fd-card rounded-lg border p-4 transition-transform",
                    index % 2 === 0 ? "translate-x-0" : "lg:translate-x-8",
                  )}
                  icon={
                    <div className="text-purple bg-fd-card mb-2">
                      {feature.icon}
                    </div>
                  }
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
