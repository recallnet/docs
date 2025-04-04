import { AlertTriangle, CircleX, Info } from "lucide-react";
import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

import { cn } from "../../lib/theme/cn";

export type CalloutProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "type" | "icon"> & {
  title?: ReactNode;
  /**
   * @defaultValue info
   */
  type?: "info" | "tip" | "warn" | "warning" | "error";

  /**
   * Force an icon
   */
  icon?: ReactNode;
};

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, children, title, type = "info", icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "nd-callout bg-fd-secondary text-fd-secondary my-6 flex flex-row gap-2 rounded-lg border px-3 py-4 text-base shadow-md",
          className
        )}
        {...props}
      >
        {icon ??
          {
            info: <Info className="stroke-fd-secondary size-5 fill-blue-500" />,
            tip: <Info className="stroke-fd-secondary size-5 fill-blue-500" />,
            warn: <AlertTriangle className="stroke-fd-secondary size-5 fill-orange-500" />,
            warning: <AlertTriangle className="stroke-fd-secondary size-5 fill-orange-500" />,
            error: <CircleX className="stroke-fd-secondary size-5 fill-red-500" />,
          }[type]}
        <div className="min-w-0 flex-1">
          {title ? (
            <p className="not-prose text-fd-muted-foreground mb-2 font-bold">{title}</p>
          ) : null}
          <div className="text-fd-muted-foreground prose-no-margin text-base">{children}</div>
        </div>
      </div>
    );
  }
);

Callout.displayName = "Callout";
