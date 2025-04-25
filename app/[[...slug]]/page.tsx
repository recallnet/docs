import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { ImageZoom, type ImageZoomProps } from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { notFound } from "next/navigation";
import { HTMLAttributes } from "react";

import { Callout, CalloutProps } from "@/components/theme/callout";
import { Card, CardProps, Cards } from "@/components/theme/card";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "@/components/theme/page";
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
  // Don't show the TOC or edit button on the root page
  const isRootPage = !params.slug || params.slug.length === 0;
  const isApiPage = params.slug?.[0] === "reference";
  const githubPath = `docs/${page.file.path}`;
  const githubInfo = {
    repo: "docs",
    owner: "recallnet",
    path: githubPath,
    sha: "main",
  };

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
