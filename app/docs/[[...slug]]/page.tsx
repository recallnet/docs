import { source } from "@/lib/source";
import { DocsPage, DocsBody, DocsDescription } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";

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

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <CustomDocsTitle>{page.data.title}</CustomDocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
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

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
