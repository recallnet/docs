"use client";

import { cva } from "class-variance-authority";
import { Airplay, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { type HTMLAttributes, useLayoutEffect, useState } from "react";

import { cn } from "@/lib/theme/cn";

const itemVariants = cva("size-7 rounded-full p-1.5 text-fd-muted-foreground", {
  variants: {
    active: {
      true: "bg-fd-accent text-fd-accent-foreground",
      false: "text-fd-muted-foreground",
    },
  },
});

export function ThemeToggle({
  className,
  mode = "light-dark",
  ...props
}: HTMLAttributes<HTMLElement> & {
  mode?: "light-dark" | "light-dark-system";
}) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const container = cn("inline-flex items-center rounded-full border p-[3px]", className);

  if (mode === "light-dark") {
    const value = mounted ? resolvedTheme : null;

    return (
      <button
        className={container}
        onClick={() => setTheme(value === "light" ? "dark" : "light")}
        data-theme-toggle=""
        {...props}
      >
        <Sun className={cn(itemVariants({ active: value === "light" }))} />
        <Moon className={cn(itemVariants({ active: value === "dark" }))} />
      </button>
    );
  }

  const value = mounted ? theme : null;

  return (
    <div className={container} data-theme-toggle="" {...props}>
      {[["light", Sun] as const, ["dark", Moon] as const, ["system", Airplay] as const].map(
        ([key, Icon]) => (
          <button
            key={key}
            aria-label={key}
            className={cn(itemVariants({ active: value === key }))}
            onClick={() => setTheme(key)}
          >
            <Icon className="size-full" />
          </button>
        )
      )}
    </div>
  );
}
