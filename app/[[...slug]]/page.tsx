import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { ImageZoom, type ImageZoomProps } from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import Image, { type ImageProps } from "next/image";
import { notFound } from "next/navigation";
import path from "path";
import { HTMLAttributes } from "react";

import { Callout, CalloutProps } from "@/components/theme/callout";
import { Card, CardProps, Cards } from "@/components/theme/card";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "@/components/theme/page";
import { getRawDocContent } from "@/lib/files";
import { createMetadata } from "@/lib/metadata";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

const defaultMdxComponents = {
  ...getMDXComponents(),
  Accordion,
  Accordions,
  File,
  Folder,
  Files,
  Step,
  Steps,
  Tab,
  Tabs,
  TypeTable,
  ImageNoZoom: (props: ImageProps) => <Image {...props} />,
  img: (props: ImageZoomProps) => <ImageZoom {...props} />,
  Card: (props: CardProps) => <Card {...props} />,
  Cards: (props: HTMLAttributes<HTMLDivElement>) => <Cards {...props} />,
  Callout: (props: CalloutProps) => <Callout {...props} />,
};

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  // Don't show the TOC or edit button on the root page, or the auto-generated API reference pages
  const isRootPage = !params.slug || params.slug.length === 0;
  const isApiReferencePage = params.slug?.[0] === "reference" && params.slug?.[1] === "endpoints";
  // Ignore the `reference/endpoints` index page since it's manually written, so we want the TOC
  const isApiReferenceRootPage =
    params.slug?.length === 2 &&
    params.slug?.[0] === "reference" &&
    params.slug?.[1] === "endpoints";
  const isApiPage = isApiReferencePage && !isApiReferenceRootPage;
  const githubPath = `docs/${page.file.path}`;
  const githubInfo = {
    repo: "docs",
    owner: "recallnet",
    path: githubPath,
    sha: "main",
  };

  // Fetch markdown content for synchronous clipboard operations
  let markdownContent: string | undefined;
  let markdownUrl: string | undefined;

  if (!isRootPage) {
    try {
      // Try both potential paths - the file might be in docs/ subdirectory
      let filePath = path.join(process.cwd(), page.file.path);

      // If the path doesn't start with docs/, try prepending it
      if (!page.file.path.startsWith("docs/")) {
        filePath = path.join(process.cwd(), "docs", page.file.path);
      }

      const docContent = await getRawDocContent(filePath);
      markdownContent = `# ${docContent.title}\n\n${docContent.description}\n\n${docContent.content}`;

      // Generate markdown URL server-side
      const rawPath = page.file.path.replace(/^docs\//, "").replace(/\.mdx$/, ".md");
      markdownUrl = `/raw/${rawPath}`;
    } catch {
      // Will fall back to showing error in component
    }
  }

  return (
    <DocsPage
      tableOfContent={
        isRootPage || isApiPage
          ? undefined
          : {
              enabled: true,
              style: "clerk",
            }
      }
      breadcrumb={{
        enabled: true,
        includeRoot: false,
        includeSeparator: true,
      }}
      toc={isRootPage || isApiPage ? undefined : page.data.toc}
      editOnGithub={isRootPage ? undefined : githubInfo}
      currentPath={isRootPage ? undefined : page.file.path}
      markdownContent={markdownContent}
      markdownUrl={markdownUrl}
    >
      {!isRootPage && <DocsTitle>{page.data.title}</DocsTitle>}
      {!isRootPage && <DocsDescription className="mb-1">{page.data.description}</DocsDescription>}
      {!isRootPage && <hr />}
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const isRootPage = !params.slug || params.slug.length === 0;
  const description = page.data.description;

  return createMetadata({
    title: isRootPage ? null : page.data.title,
    description: isRootPage ? null : description,
    openGraph: {
      url: `/${page.slugs.join("/")}`,
    },
  });
}
