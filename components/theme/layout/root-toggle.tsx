"use client";

import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import { useSidebar } from "fumadocs-ui/contexts/sidebar";
import { Check, ChevronsUpDown } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";

import { cn } from "../../../lib/theme/cn";
import { isActive } from "../../../lib/theme/is-active";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export interface Option {
  /**
   * Redirect URL of the folder, usually the index page
   */
  url: string;

  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;

  /**
   * Detect from a list of urls
   */
  urls?: Set<string>;

  props?: ComponentProps<"a">;
}

export function RootToggle({
  options,
  placeholder,
  ...props
}: {
  placeholder?: ReactNode;
  options: Option[];
} & ComponentProps<"button">) {
  const [open, setOpen] = useState(false);
  const { closeOnRedirect } = useSidebar();
  const pathname = usePathname();

  const selected = useMemo(() => {
    const lookup = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

    return options.findLast((item) => {
      if (item.urls) return item.urls.has(lookup);

      return isActive(item.url, pathname, true);
    });
  }, [options, pathname]);

  const onClick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };

  const item = selected ? (
    <>
      <div className="size-9 md:size-5">{selected.icon}</div>
      <div>
        <p className="text-sm font-medium">{selected.title}</p>
        <p className="text-fd-muted-foreground text-[13px] empty:hidden md:hidden">
          {selected.description}
        </p>
      </div>
    </>
  ) : (
    placeholder
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {item && (
        <PopoverTrigger
          {...props}
          className={cn(
            "bg-fd-secondary/50 text-fd-secondary-foreground hover:bg-fd-accent data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground flex items-center gap-2 rounded-lg border p-2 text-start transition-colors",
            props.className
          )}
        >
          {item}
          <ChevronsUpDown className="text-fd-muted-foreground ms-auto size-4" />
        </PopoverTrigger>
      )}
      <PopoverContent className="flex min-w-(--radix-popover-trigger-width) flex-col gap-1 overflow-hidden p-1">
        {options.map((item) => {
          const isActive = item === selected;

          return (
            <Link
              key={item.url}
              href={item.url}
              onClick={onClick}
              {...item.props}
              className={cn(
                "hover:bg-fd-accent hover:text-fd-accent-foreground flex items-center gap-2 rounded-lg p-1.5",
                item.props?.className
              )}
            >
              <div className="size-9 md:mt-1 md:mb-auto md:size-5">{item.icon}</div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-fd-muted-foreground text-[13px] empty:hidden">
                  {item.description}
                </p>
              </div>

              <Check className={cn("text-fd-primary ms-auto size-3.5", !isActive && "invisible")} />
            </Link>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
