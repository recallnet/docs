import type { PageTree } from "fumadocs-core/server";
import { TreeContextProvider } from "fumadocs-ui/provider";
import { type PageStyles, StylesProvider } from "fumadocs-ui/provider";
import { ChevronDown, ExternalLink, Languages } from "lucide-react";
import Link from "next/link";
import { Fragment, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/theme/cn";

import { Banner } from "./banner";
import {
  SidebarLinkItem,
  type SidebarOptions,
  checkPageTree,
  getSidebarTabsFromOptions,
  layoutVariables,
} from "./docs/shared";
import {
  CollapsibleSidebar,
  Sidebar,
  SidebarCollapseTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarPageTree,
  SidebarViewport,
} from "./docs/sidebar";
import { LanguageToggle } from "./layout/language-toggle";
import { NavProvider, Title } from "./layout/nav";
import { RootToggle } from "./layout/root-toggle";
import { LargeSearchToggle, SearchToggle } from "./layout/search-toggle";
import { ThemeToggle } from "./layout/theme-toggle";
import { BaseLinkItem, type LinkItemType } from "./links";
import { Navbar, NavbarSidebarTrigger } from "./notebook.client";
import { type BaseLayoutProps, type SharedNavProps, getLinks } from "./shared";
import { buttonVariants } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;

  sidebar?: Omit<Partial<SidebarOptions>, "component" | "enabled">;

  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export function DocsLayout({
  nav: { transparentMode, ...nav } = {},
  sidebar: {
    collapsible: sidebarCollapsible = true,
    tabs: tabOptions,
    banner: sidebarBanner,
    footer: sidebarFooter,
    components: sidebarComponents,
    ...sidebar
  } = {},
  i18n = false,
  ...props
}: DocsLayoutProps): ReactNode {
  checkPageTree(props.tree);
  const links = getLinks(props.links ?? [], props.githubUrl);
  const Aside = sidebarCollapsible ? CollapsibleSidebar : Sidebar;

  const tabs = getSidebarTabsFromOptions(tabOptions, props.tree) ?? [];
  const variables = cn(
    "[--fd-nav-height:3.5rem] [--fd-tocnav-height:36px] md:[--fd-sidebar-width:268px] xl:[--fd-toc-width:268px] xl:[--fd-tocnav-height:0px]"
  );

  const pageStyles: PageStyles = {
    tocNav: cn("xl:hidden"),
    toc: cn("max-xl:hidden"),
    page: cn("mt-[var(--fd-nav-height)]"),
  };

  return (
    <TreeContextProvider tree={props.tree}>
      {props.banner && <Banner {...props.banner} />}
      <NavProvider transparentMode={transparentMode}>
        <main
          id="nd-docs-layout"
          {...props.containerProps}
          className={cn(
            "flex w-full flex-1 flex-row pe-[var(--fd-layout-offset)]",
            variables,
            props.containerProps?.className
          )}
          style={{
            ...layoutVariables,
            ...props.containerProps?.style,
          }}
        >
          <Aside
            {...sidebar}
            className={cn(
              "md:ps-[var(--fd-layout-offset)] md:[--fd-nav-height:0px]",
              sidebar.className
            )}
          >
            <SidebarHeader>
              <SidebarHeaderItems nav={nav} links={links}>
                {nav.children}
                {sidebarCollapsible ? (
                  <SidebarCollapseTrigger className="text-fd-muted-foreground ms-auto" />
                ) : null}
              </SidebarHeaderItems>
              {sidebarBanner}
              {tabs.length > 0 ? <RootToggle options={tabs} className="-mx-2" /> : null}
            </SidebarHeader>
            <SidebarViewport className="pb-6">
              <div className="mb-4 empty:hidden lg:hidden">
                {links.map((item, i) => (
                  <SidebarLinkItem key={i} item={item} />
                ))}
              </div>
              <SidebarPageTree components={sidebarComponents} />
            </SidebarViewport>
            <SidebarFooter>
              {sidebarFooter ? (
                sidebarFooter
              ) : (
                <>{!props.disableThemeSwitch && <ThemeToggle className="w-fit md:hidden" />}</>
              )}
            </SidebarFooter>
          </Aside>
          <DocsNavbar
            nav={nav}
            links={links}
            i18n={i18n}
            sidebarCollapsible={sidebarCollapsible}
            disableThemeSwitch={props.disableThemeSwitch}
          />
          <StylesProvider {...pageStyles}>{props.children}</StylesProvider>
        </main>
      </NavProvider>
    </TreeContextProvider>
  );
}

function DocsNavbar({
  sidebarCollapsible,
  links,
  nav = {},
  i18n,
  disableThemeSwitch,
}: {
  nav: DocsLayoutProps["nav"];
  sidebarCollapsible: boolean;
  i18n: boolean;
  links: LinkItemType[];
  disableThemeSwitch?: boolean;
}) {
  return (
    <Navbar>
      {sidebarCollapsible ? (
        <SidebarCollapseTrigger className="text-fd-muted-foreground -ms-1.5 data-[collapsed=false]:hidden max-md:hidden" />
      ) : null}
      <LargeSearchToggle hideIfDisabled className="w-full max-w-[240px] rounded-lg max-md:hidden" />
      <Title url={nav.url} title={nav.title} className="md:hidden" />
      <div className="flex flex-1 flex-row items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          {links
            .filter((item) => item.type !== "icon" && item.position !== "right")
            .map((item, i) => (
              <NavbarLinkItem
                key={i}
                item={item}
                className="text-fd-muted-foreground hover:text-fd-accent-foreground text-sm transition-colors max-lg:hidden"
              />
            ))}
          {nav.children}
        </div>
        <div className="flex items-center gap-6">
          {links
            .filter((item) => item.position === "right")
            .map((item, i) => (
              <NavbarLinkItem
                key={i}
                item={item}
                className="text-fd-muted-foreground hover:text-fd-accent-foreground text-sm transition-colors max-lg:hidden"
              />
            ))}
        </div>
      </div>
      <SearchToggle hideIfDisabled className="md:hidden" />
      <NavbarSidebarTrigger className="-me-1.5 md:hidden" />
      <div className="flex flex-row items-center empty:hidden max-lg:hidden">
        {links
          .filter((item) => item.type === "icon")
          .map((item, i) => (
            <BaseLinkItem
              key={i}
              item={item}
              className={cn(
                buttonVariants({ size: "icon", color: "ghost" }),
                "text-fd-muted-foreground"
              )}
              aria-label={item.label}
            >
              {item.icon}
            </BaseLinkItem>
          ))}
      </div>
      {i18n ? (
        <LanguageToggle>
          <Languages className="size-5" />
        </LanguageToggle>
      ) : null}
      {!disableThemeSwitch ? <ThemeToggle className="w-fit max-md:hidden" /> : null}
    </Navbar>
  );
}

function NavbarLinkItem({ item, ...props }: { item: LinkItemType } & HTMLAttributes<HTMLElement>) {
  if (item.type === "menu") {
    return (
      <Popover>
        <PopoverTrigger
          {...props}
          className={cn("inline-flex items-center gap-1.5", props.className)}
        >
          {item.text}
          <ChevronDown className="size-3" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col">
          {item.items.map((child, i) => {
            if (child.type === "custom") return <Fragment key={i}>{child.children}</Fragment>;

            return (
              <BaseLinkItem
                key={i}
                item={child}
                className="hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:text-fd-primary inline-flex items-center gap-2 rounded-md p-2 text-start [&_svg]:size-4"
              >
                {child.icon}
                {child.text}
              </BaseLinkItem>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  }

  if (item.type === "custom") return item.children;

  if (item.external) {
    return (
      <BaseLinkItem item={item} {...props}>
        <div className="inline-flex items-center gap-1">
          {item.text}
          <ExternalLink className="size-3" />
        </div>
      </BaseLinkItem>
    );
  }

  return (
    <BaseLinkItem item={item} {...props}>
      {item.text}
      <span className="ml-1">{item.icon}</span>
    </BaseLinkItem>
  );
}

function SidebarHeaderItems({
  links,
  nav = {},
  children,
}: SharedNavProps & {
  nav: DocsLayoutProps["nav"];
  links: LinkItemType[];
  children: ReactNode;
}) {
  const isEmpty = !nav.title && !nav.children && links.length === 0;
  if (isEmpty) return null;

  return (
    <div className="center ml-2 flex flex-row items-center max-md:hidden">
      {nav.title ? (
        <Link href={nav.url ?? "/"} className="inline-flex items-center gap-2.5 font-medium">
          {nav.title}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
