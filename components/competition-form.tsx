"use client";

import { PopupButton } from "@typeform/embed-react";
import { PartyPopper } from "lucide-react";

import { cn } from "@/lib/theme/cn";

import { buttonVariants } from "./theme/ui/button";

export default function JoinCompetitionButton() {
  return (
    <PopupButton id="I84sAGZ4" style={{ fontSize: 20 }} className="my-button">
      <div
        className={cn(
          buttonVariants({
            color: "secondary",
          }),
          "bg-blue text-fd-primary-foreground dark:text-accent-foreground hover:bg-blue/80 p-4 text-base font-bold no-underline transition-all duration-100"
        )}
      >
        <span className="mr-1 text-base">Join the competition</span>
        <PartyPopper className="size-4" />
      </div>
    </PopupButton>
  );
}
