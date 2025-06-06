import { type PageTree, type TableOfContents } from "fumadocs-core/server";
import type { LoaderConfig, LoaderOutput, Page } from "fumadocs-core/source";
import { AnchorProvider, type AnchorProviderProps } from "fumadocs-core/toc";
import { I18nLabel } from "fumadocs-ui/provider";
import { Edit, Text } from "lucide-react";
import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode, forwardRef } from "react";

import { MarkdownActions } from "@/components/md-copy/actions";
import { cn } from "@/lib/theme/cn";
import {
  Breadcrumb,
  type BreadcrumbProps,
  Footer,
  type FooterProps,
  LastUpdate,
  PageArticle,
  PageBody,
  TocPopoverHeader,
} from "@/page.client";

import { Card, Cards } from "./card";
import {
  TOCItems,
  type TOCProps,
  TOCScrollArea,
  Toc,
  TocPopoverContent,
  TocPopoverTrigger,
} from "./layout/toc";
import ClerkTOCItems from "./layout/toc-clerk";
import { replaceOrDefault } from "./shared";
import { buttonVariants } from "./ui/button";

type TableOfContentOptions = Omit<TOCProps, "items" | "children"> &
  Pick<AnchorProviderProps, "single"> & {
    enabled: boolean;
    component: ReactNode;

    /**
     * @defaultValue 'normal'
     */
    style?: "normal" | "clerk";
  };

type TableOfContentPopoverOptions = Omit<TableOfContentOptions, "single">;

interface EditOnGitHubOptions
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
  owner: string;
  repo: string;

  /**
   * SHA or ref (branch or tag) name.
   *
   * @defaultValue main
   */
  sha?: string;

  /**
   * File path in the repo
   */
  path: string;
}

interface BreadcrumbOptions extends BreadcrumbProps {
  enabled: boolean;
  component: ReactNode;

  /**
   * Show the full path to the current page
   *
   * @defaultValue false
   * @deprecated use `includePage` instead
   */
  full?: boolean;
}

interface FooterOptions extends FooterProps {
  enabled: boolean;
  component: ReactNode;
}

export interface DocsPageProps {
  toc?: TableOfContents;
  currentPath?: string;

  /**
   * Extend the page to fill all available space
   *
   * @defaultValue false
   */
  full?: boolean;

  tableOfContent?: Partial<TableOfContentOptions>;
  tableOfContentPopover?: Partial<TableOfContentPopoverOptions>;

  /**
   * Replace or disable breadcrumb
   */
  breadcrumb?: Partial<BreadcrumbOptions>;

  /**
   * Footer navigation, you can disable it by passing `false`
   */
  footer?: Partial<FooterOptions>;

  editOnGithub?: EditOnGitHubOptions;
  lastUpdate?: Date | string | number;

  container?: HTMLAttributes<HTMLDivElement>;
  article?: HTMLAttributes<HTMLElement>;
  children: ReactNode;
}

export function DocsPage({
  toc = [],
  full = false,
  tableOfContentPopover: {
    enabled: tocPopoverEnabled,
    component: tocPopoverReplace,
    ...tocPopoverOptions
  } = {},
  tableOfContent: { enabled: tocEnabled, component: tocReplace, ...tocOptions } = {},
  ...props
}: DocsPageProps) {
  const isTocRequired =
    toc.length > 0 || tocOptions.footer !== undefined || tocOptions.header !== undefined;

  // disable TOC on full mode, you can still enable it with `enabled` option.
  tocEnabled ??= !full && isTocRequired;

  tocPopoverEnabled ??=
    toc.length > 0 ||
    tocPopoverOptions.header !== undefined ||
    tocPopoverOptions.footer !== undefined;

  return (
    <AnchorProvider toc={toc} single={tocOptions.single}>
      <PageBody
        {...props.container}
        className={cn(props.container?.className)}
        style={
          {
            "--fd-tocnav-height": !tocPopoverEnabled ? "0px" : undefined,
            ...props.container?.style,
          } as object
        }
      >
        {replaceOrDefault(
          { enabled: tocPopoverEnabled, component: tocPopoverReplace },
          <TocPopoverHeader className="h-10">
            <TocPopoverTrigger className="w-full" items={toc} />
            <TocPopoverContent>
              {tocPopoverOptions.header}
              <TOCScrollArea isMenu>
                {tocPopoverOptions.style === "clerk" ? (
                  <ClerkTOCItems items={toc} />
                ) : (
                  <TOCItems items={toc} />
                )}
              </TOCScrollArea>
              {tocPopoverOptions.footer}
            </TocPopoverContent>
          </TocPopoverHeader>,
          {
            items: toc,
            ...tocPopoverOptions,
          }
        )}
        <PageArticle
          {...props.article}
          className={cn(
            full || !tocEnabled ? "max-w-[1120px]" : "max-w-[860px]",
            props.article?.className
          )}
        >
          <div className="flex items-center justify-between">
            {replaceOrDefault(props.breadcrumb, <Breadcrumb {...props.breadcrumb} />)}
            {props.currentPath && <MarkdownActions currentPath={props.currentPath} />}
          </div>
          {props.children}
          <div role="none" className="flex-1" />
          <div className="flex flex-row flex-wrap items-center justify-between gap-4 empty:hidden">
            {props.editOnGithub ? <EditOnGitHub {...props.editOnGithub} /> : null}
            {props.lastUpdate ? <LastUpdate date={new Date(props.lastUpdate)} /> : null}
          </div>
          {replaceOrDefault(props.footer, <Footer items={props.footer?.items} />)}
        </PageArticle>
      </PageBody>
      {replaceOrDefault(
        { enabled: tocEnabled, component: tocReplace },
        <Toc>
          {tocOptions.header}
          <h3 className="text-fd-muted-foreground inline-flex items-center gap-1.5 text-sm">
            <Text className="size-4" />
            <I18nLabel label="toc" />
          </h3>
          <TOCScrollArea>
            {tocOptions.style === "clerk" ? (
              <ClerkTOCItems items={toc} />
            ) : (
              <TOCItems items={toc} />
            )}
          </TOCScrollArea>
          {tocOptions.footer}
        </Toc>,
        {
          items: toc,
          ...tocOptions,
        }
      )}
    </AnchorProvider>
  );
}

function EditOnGitHub({ owner, repo, sha, path, ...props }: EditOnGitHubOptions) {
  const href = `https://github.com/${owner}/${repo}/blob/${sha}/${path.startsWith("/") ? path.slice(1) : path}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      {...props}
      className={cn(
        buttonVariants({
          color: "secondary",
          className: "text-fd-muted-foreground gap-1.5",
        }),
        props.className
      )}
    >
      <Edit className="size-3.5" />
      <I18nLabel label="editOnGithub" />
    </a>
  );
}

/**
 * Add typography styles
 */
export const DocsBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} className={cn("prose", props.className)}>
    {props.children}
  </div>
));

DocsBody.displayName = "DocsBody";

export const DocsDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  // don't render if no description provided
  if (props.children === undefined) return null;

  return (
    <p
      ref={ref}
      {...props}
      className={cn("text-fd-muted-foreground mb-8 text-lg", props.className)}
    >
      {props.children}
    </p>
  );
});

DocsDescription.displayName = "DocsDescription";

export const DocsTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  (props, ref) => {
    return (
      <h1 ref={ref} {...props} className={cn("text-3xl font-semibold", props.className)}>
        {props.children}
      </h1>
    );
  }
);

DocsTitle.displayName = "DocsTitle";

export function DocsCategory({
  page,
  from,
  tree: forcedTree,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  page: Page;
  from: LoaderOutput<LoaderConfig>;
  tree?: PageTree.Root;
}) {
  let tree;

  if (forcedTree) {
    tree = forcedTree;
  } else if (from._i18n) {
    const locale = page.locale ?? from._i18n.defaultLanguage;

    tree = (from as LoaderOutput<LoaderConfig & { i18n: true }>).pageTree[locale];
  } else {
    tree = from.pageTree;
  }

  function findParentFromTree(
    node: PageTree.Root | PageTree.Folder,
    page: Page
  ): PageTree.Root | PageTree.Folder | undefined {
    if ("index" in node && node.index?.$ref?.file === page.file.path) {
      return node;
    }

    for (const child of node.children) {
      if (child.type === "folder") {
        const parent = findParentFromTree(child, page);
        if (parent) return parent;
      }

      if (child.type === "page" && child.$ref?.file === page.file.path) {
        return node;
      }
    }
  }

  let items;
  if (!tree) {
    return null;
  }
  const parent = findParentFromTree(tree, page);
  if (parent) {
    items = parent.children.flatMap<Page>((item) => {
      if (item.type !== "page" || item.url === page.url) return [];

      return from.getNodePage(item) ?? [];
    });
  } else {
    const pages = from.getPages(page.locale);

    items = pages.filter(
      (item) => item.file.dirname === page.file.dirname && item.file.path !== page.file.path
    );
  }

  if (items.length === 0) return null;

  return (
    <Cards {...props}>
      {items.map((item) => (
        <Card
          key={item.url}
          title={item.data.title ?? ""}
          description={item.data.description ?? ""}
          href={item.url}
        />
      ))}
    </Cards>
  );
}

/**
 * For separate MDX page
 */
export function withArticle({ children }: { children: ReactNode }): ReactNode {
  return (
    <main className="container py-12">
      <article className="prose">{children}</article>
    </main>
  );
}
