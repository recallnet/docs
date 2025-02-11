"use client";

import Link from "fumadocs-core/link";
import { usePathname } from "next/navigation";
import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode, forwardRef } from "react";

import { cn } from "@/lib/theme/cn";
import { isActive } from "@/lib/theme/is-active";

interface BaseItem {
  /**
   * Restrict where the item is displayed
   *
   * @defaultValue 'all'
   */
  on?: "menu" | "nav" | "all";
  position?: "left" | "right";
}

export interface BaseLinkType extends BaseItem {
  url: string;
  /**
   * When the item is marked as active
   *
   * @defaultValue 'url'
   */
  active?: "url" | "nested-url" | "none";
  external?: boolean;
  className?: string;
}

export interface MainItemType extends BaseLinkType {
  type?: "main";
  icon?: ReactNode;
  text: ReactNode;
  description?: ReactNode;
}

export interface IconItemType extends BaseLinkType {
  type: "icon";
  /**
   * `aria-label` of icon button
   */
  label?: string;
  icon: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue true
   */
  secondary?: boolean;
}

interface ButtonItem extends BaseLinkType {
  type: "button";
  icon?: ReactNode;
  text: ReactNode;
  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

export interface MenuItemType extends BaseItem {
  type: "menu";
  icon?: ReactNode;
  text: ReactNode;

  url?: string;
  items: (
    | (MainItemType & {
        /**
         * Options when displayed on navigation menu
         */
        menu?: HTMLAttributes<HTMLElement> & {
          banner?: ReactNode;
          footer?: ReactNode;
        };
      })
    | CustomItem
  )[];

  /**
   * @defaultValue false
   */
  secondary?: boolean;
}

interface CustomItem extends BaseItem {
  type: "custom";
  /**
   * @defaultValue false
   */
  secondary?: boolean;
  children: ReactNode;
}

export type LinkItemType = MainItemType | IconItemType | ButtonItem | MenuItemType | CustomItem;

export const BaseLinkItem = forwardRef<
  HTMLAnchorElement,
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { item: BaseLinkType }
>(({ item, className, ...props }, ref) => {
  const pathname = usePathname();
  const activeType = item.active ?? "url";
  const active = activeType !== "none" && isActive(item.url, pathname, activeType === "nested-url");

  return (
    <Link
      ref={ref}
      href={item.url}
      external={item.external}
      {...props}
      className={cn(item.className, className)}
      data-active={active}
    >
      {props.children}
    </Link>
  );
});

BaseLinkItem.displayName = "BaseLinkItem";
