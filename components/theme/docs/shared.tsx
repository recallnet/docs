import type { PageTree } from "fumadocs-core/server";
import { notFound } from "next/navigation";
import type { FC, ReactNode } from "react";

import type { Option } from "@/components/theme/layout/root-toggle";
import { BaseLinkItem, type LinkItemType } from "@/components/theme/links";
import { buttonVariants } from "@/components/theme/ui/button";
import { cn } from "@/lib/theme/cn";

import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  type SidebarProps,
} from "./sidebar";

export const layoutVariables = {
  "--fd-layout-offset": "max(calc(50vw - var(--fd-layout-width) / 2), 0px)",
};

export interface TabOptions {
  transform?: (option: Option, node: PageTree.Folder) => Option | null;
}

export interface SidebarOptions extends SidebarProps {
  enabled: boolean;
  component: ReactNode;

  collapsible?: boolean;
  components?: Partial<SidebarComponents>;

  /**
   * Root Toggle options
   */
  tabs?: Option[] | TabOptions | false;

  banner?: ReactNode;
  footer?: ReactNode;

  /**
   * Hide search trigger. You can also disable search for the entire site from `<RootProvider />`.
   *
   * @defaultValue false
   */
  hideSearch?: boolean;
}

export interface SidebarComponents {
  Item: FC<{ item: PageTree.Item }>;
  Folder: FC<{ item: PageTree.Folder; level: number; children: ReactNode }>;
  Separator: FC<{ item: PageTree.Separator }>;
}

export function SidebarLinkItem({ item, ...props }: { item: LinkItemType; className?: string }) {
  if (item.type === "menu")
    return (
      <SidebarFolder {...props}>
        {item.url ? (
          <SidebarFolderLink href={item.url}>
            {item.icon}
            {item.text}
          </SidebarFolderLink>
        ) : (
          <SidebarFolderTrigger>
            {item.icon}
            {item.text}
          </SidebarFolderTrigger>
        )}
        <SidebarFolderContent>
          {item.items.map((child, i) => (
            <SidebarLinkItem key={i} item={child} />
          ))}
        </SidebarFolderContent>
      </SidebarFolder>
    );

  if (item.type === "button") {
    return (
      <BaseLinkItem
        item={item}
        {...props}
        className={cn(
          buttonVariants({
            color: "secondary",
          }),
          "gap-1.5 [&_svg]:size-4",
          props.className
        )}
      >
        {item.icon}
        {item.text}
      </BaseLinkItem>
    );
  }

  if (item.type === "custom") return item.children;

  return (
    <SidebarItem href={item.url} icon={item.icon} external={item.external} {...props}>
      {item.text}
    </SidebarItem>
  );
}

export function checkPageTree(passed: unknown) {
  if (!passed) notFound();
  if (typeof passed === "object" && "children" in passed && Array.isArray(passed.children)) return;

  throw new Error(
    "You passed an invalid page tree to `<DocsLayout />`. Check your usage in layout.tsx if you have enabled i18n."
  );
}

export function getSidebarTabsFromOptions(options: SidebarOptions["tabs"], tree: PageTree.Root) {
  if (Array.isArray(options)) {
    return options;
  } else if (typeof options === "object") {
    return getSidebarTabs(tree, options);
  } else if (options !== false) {
    return getSidebarTabs(tree);
  }
}

const defaultTransform: TabOptions["transform"] = (option, node) => {
  if (!node.icon) return option;

  return {
    ...option,
    icon: (
      <div className="bg-fd-secondary rounded-md border p-1 shadow-md [&_svg]:size-5">
        {node.icon}
      </div>
    ),
  };
};

function getSidebarTabs(
  pageTree: PageTree.Root,
  { transform = defaultTransform }: TabOptions = {}
): Option[] {
  function findOptions(node: PageTree.Folder): Option[] {
    const results: Option[] = [];

    if (node.root) {
      const index = node.index ?? node.children.at(0);

      if (index?.type === "page") {
        const option: Option = {
          url: index.url,
          title: node.name,
          icon: node.icon,
          description: node.description,

          urls: getFolderUrls(node, new Set()),
        };

        const mapped = transform ? transform(option, node) : option;
        if (mapped) results.push(mapped);
      }
    }

    for (const child of node.children) {
      if (child.type === "folder") results.push(...findOptions(child));
    }

    return results;
  }

  return findOptions(pageTree as PageTree.Folder);
}

function getFolderUrls(folder: PageTree.Folder, output: Set<string>): Set<string> {
  if (folder.index) output.add(folder.index.url);

  for (const child of folder.children) {
    if (child.type === "page") output.add(child.url);
    if (child.type === "folder") getFolderUrls(child, output);
  }

  return output;
}
