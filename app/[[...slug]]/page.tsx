import { source } from "@/lib/source";
import { DocsPage, DocsBody, DocsDescription } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { metadataImage } from "@/lib/metadata";
import { createMetadata } from "@/lib/metadata";

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
              className="px-[3px] border border-[var(--color-fd-border)] rounded font-normal bg-[var(--color-fd-muted)] text-[var(--tw-prose-code)]"
            >
              {part}
            </code>
          )
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
  const path = `docs/${page.file.path}`;

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
      editOnGithub={
        isRootPage
          ? undefined
          : {
              repo: "docs",
              owner: "recallnet",
              sha: "main",
              path: path,
            }
      }
    >
      <CustomDocsTitle>{page.data.title}</CustomDocsTitle>
      <DocsDescription className="mb-1">
        {page.data.description}
      </DocsDescription>
      <hr className="" />
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
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
    })
  );
}
