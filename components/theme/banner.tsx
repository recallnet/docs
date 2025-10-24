"use client";

import { X } from "lucide-react";
import { type HTMLAttributes, ReactNode, useCallback, useEffect, useState } from "react";

import { cn } from "../../lib/theme/cn";
import { buttonVariants } from "./ui/button";

export type BannerProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * @defaultValue 'normal'
   */
  variant?: "rainbow" | "normal";

  /**
   * Change Fumadocs layout styles
   *
   * @defaultValue true
   */
  changeLayout?: boolean;

  /**
   * @defaultValue 2rem
   */
  height?: string;

  /**
   * Banner content
   */
  children?: ReactNode;
};

export function Banner({
  id,
  variant = "normal",
  changeLayout = true,
  height = "2rem",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * @defaultValue 3rem
   */
  height?: string;

  /**
   * @defaultValue 'normal'
   */
  variant?: "rainbow" | "normal";

  /**
   * Change Fumadocs layout styles
   *
   * @defaultValue true
   */
  changeLayout?: boolean;

  /**
   * Banner content
   */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const globalKey = id ? `nd-banner-${id}` : null;

  useEffect(() => {
    if (globalKey) setOpen(localStorage.getItem(globalKey) !== "true");
  }, [globalKey]);

  const onClick = useCallback(() => {
    setOpen(false);
    if (globalKey) localStorage.setItem(globalKey, "true");
  }, [globalKey]);

  if (!open) return null;

  return (
    <div
      id={id}
      {...props}
      className={cn(
        "bg-fd-secondary border-fd-border fixed top-0 right-0 left-0 z-50 flex flex-row items-center justify-center border-b px-4 text-center text-sm font-medium",
        variant === "rainbow" && "dark:bg-fd-background",
        !open && "hidden",
        props.className
      )}
      style={{
        height,
      }}
    >
      {changeLayout && open ? (
        <style>
          {globalKey
            ? `:root:not(.${globalKey}) { --fd-banner-height: ${height}; }`
            : `:root { --fd-banner-height: ${height}; }`}
        </style>
      ) : null}
      {globalKey ? <style>{`.${globalKey} #${id} { display: none; }`}</style> : null}
      {globalKey ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `if (localStorage.getItem('${globalKey}') === 'true') document.documentElement.classList.add('${globalKey}');`,
          }}
        />
      ) : null}

      {variant === "rainbow" ? rainbowLayer : null}
      <div className="flex max-w-full flex-wrap items-center justify-center gap-2">{children}</div>
      {id ? (
        <button
          type="button"
          aria-label="Close Banner"
          onClick={onClick}
          className={cn(
            buttonVariants({
              color: "ghost",
              className: "text-fd-muted-foreground absolute end-2 top-1/2 -translate-y-1/2",
              size: "icon",
            })
          )}
        >
          <X />
        </button>
      ) : null}
    </div>
  );
}

const maskImage =
  "linear-gradient(to bottom,white,transparent), radial-gradient(circle at top center, white, transparent)";

const rainbowLayer = (
  <>
    <div
      className="absolute inset-0 z-[-1]"
      style={
        {
          maskImage,
          maskComposite: "intersect",
          animation: "fd-moving-banner 16s linear infinite",
          "--start": "var(--color-blue)",
          "--mid": "var(--color-red)",
          "--end": "var(--color-yellow)",
          "--via": "var(--color-green)",
          animationDirection: "reverse",
          backgroundImage:
            "repeating-linear-gradient(60deg, var(--end), var(--start) 2%, var(--start) 5%, transparent 8%, transparent 14%, var(--via) 18%, var(--via) 22%, var(--mid) 28%, var(--mid) 30%, var(--via) 34%, var(--via) 36%, transparent, var(--end) calc(50% - 12px))",
          backgroundSize: "200% 100%",
          mixBlendMode: "difference",
          opacity: 0.5,
        } as object
      }
    />
    <div
      className="absolute inset-0 z-[-1]"
      style={
        {
          maskImage,
          maskComposite: "intersect",
          animation: "fd-moving-banner 20s linear infinite",
          "--start": "var(--color-red)",
          "--mid": "var(--color-blue)",
          "--end": "var(--color-green)",
          "--via": "var(--color-yellow)",
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--end), var(--start) 4%, var(--start) 8%, transparent 9%, transparent 14%, var(--mid) 16%, var(--mid) 20%, transparent, var(--via) 36%, var(--via) 40%, transparent 42%, var(--end) 46%, var(--end) calc(50% - 16.8px))",
          backgroundSize: "200% 100%",
          mixBlendMode: "color-dodge",
          opacity: 0.45,
        } as object
      }
    />
    <style>
      {`@keyframes fd-moving-banner {
            from { background-position: 0% 0;  }
            to { background-position: 100% 0;  }
         }`}
    </style>
  </>
);
