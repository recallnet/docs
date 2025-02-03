import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import {
  ImageZoom,
  type ImageZoomProps,
} from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage } from "fumadocs-ui/page";
import { notFound } from "next/navigation";

import { metadataImage } from "@/lib/metadata";
import { createMetadata } from "@/lib/metadata";
import { source } from "@/lib/source";

// Handle titles with backticks to render inline code blocks
function CustomDocsTitle({ children }: { children: React.ReactNode }) {
  if (typeof children === "string") {
    return (
      <h1 className="text-3xl font-bold" key={children}>
        {children.split("`").map((part, i) =>
          i % 2 === 0 ? (
            part
          ) : (
            <code
              key={i}
              className="rounded border border-[var(--color-fd-border)] bg-[var(--color-fd-muted)] px-[3px] font-normal text-[var(--tw-prose-code)]"
            >
              {part}
            </code>
          ),
        )}
      </h1>
    );
  }
  return <h1 className="text-3xl font-bold">{children}</h1>;
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  // Don't show the TOC or edit button on the root page
  const isRootPage = !params.slug || params.slug.length === 0;
  const githubPath = `docs/${page.file.path}`;
  const githubInfo = {
    repo: "docs",
    owner: "recallnet",
    path: githubPath,
  };

  return (
    <DocsPage
      tableOfContent={
        isRootPage
          ? undefined
          : {
              enabled: true,
              style: "clerk",
            }
      }
      toc={isRootPage ? undefined : page.data.toc}
      full={page.data.full}
      editOnGithub={isRootPage ? undefined : githubInfo}
    >
      <CustomDocsTitle>{page.data.title}</CustomDocsTitle>
      <DocsDescription className="mb-1">
        {page.data.description}
      </DocsDescription>
      <hr />
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
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
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const description =
    page.data.description ?? "Recall documentation for building agent memory";

  return createMetadata(
    metadataImage.withImage(page.slugs, {
      title: page.data.title,
      description,
      openGraph: {
        url: `/${page.slugs.join("/")}`,
      },
    }),
  );
}
