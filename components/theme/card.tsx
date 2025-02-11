import Link from "fumadocs-core/link";
import { type HTMLAttributes, type ReactNode, isValidElement } from "react";
import * as React from "react";

import { cn } from "@/lib/theme/cn";

export function Cards(props: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div {...props} className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", props.className)}>
      {props.children}
    </div>
  );
}

export type CardProps = HTMLAttributes<HTMLElement> & {
  icon?: ReactNode;
  title: string;
  titleClassName?: string;
  description?: string;
  descriptionClassName?: string;
  href?: string;
  external?: boolean;
};

export function Card({
  icon,
  title,
  titleClassName,
  description,
  descriptionClassName,
  ...props
}: CardProps): React.ReactElement {
  const E = props.href ? Link : "div";

  return (
    <E
      {...props}
      data-card
      className={cn(
        "bg-fd-card text-fd-card-foreground block rounded-lg border p-4 shadow-md transition-colors",
        props.href && "hover:bg-fd-accent/80",
        props.className
      )}
    >
      {icon ? (
        <div
          className={cn(
            "not-prose mb-2 w-fit rounded-md py-1.5",
            isValidElement(icon)
              ? (icon as { props: { className?: string } }).props.className
              : "bg-fd-muted text-fd-muted-foreground"
          )}
        >
          {icon}
        </div>
      ) : null}
      <h3 className={cn("not-prose mb-1 text-sm font-medium", titleClassName)}>{title}</h3>
      {description ? (
        <p className={cn("text-fd-muted-foreground my-0 text-sm", descriptionClassName)}>
          {description}
        </p>
      ) : null}
      {props.children ? (
        <div className="text-fd-muted-foreground prose-no-margin text-sm">{props.children}</div>
      ) : null}
    </E>
  );
}
