import React from "react";
import { DocsThemeConfig, useConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";
import LogoSvg from "./components/LogoSvg";

const config: DocsThemeConfig = {
  logo: (
    <>
      <LogoSvg height={22} width={100} />
      <span style={{ marginLeft: ".4em", fontWeight: 500 }}>DOCS</span>
    </>
  ),
  project: {
    link: "https://github.com/recallnet",
  },
  darkMode: true,
  chat: {
    // link: "https://discord.com/recallnet",
  },
  docsRepositoryBase: "https://github.com/recallnet/docs",
  editLink: {
    text: "Edit this page on GitHub →",
  },
  feedback: {
    content: "Question? Give us feedback →",
    labels: "feedback",
  },
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/home") {
      return {
        titleTemplate: "%s – Recall docs",
      };
    }
  },
  head: () => {
    const { frontMatter } = useConfig();
    // TODO: determine default keywords for SEO (also, should it be joined on a
    // per-page basis, or should each page be unique?)
    const keywords = frontMatter.keywords || "Recall docs, Recall protocol, Recall network";
    return (
      <>
        <meta
          name="og:title"
          content="Recall docs: the official documentation for the Recall protocol"
        />
        <meta name="keywords" content={keywords} />
        <link rel="icon" href="/img/favicon.ico" />
      </>
    );
  },
  sidebar: {
    titleComponent({ title, type }) {
      // Handle separator in sidebar
      if (type === "separator") {
        return (
          <>
            <span className="cursor-default separator-span">{title}</span>
            <hr className="nx-mt-2 nx-border-t nx-border-gray-200 dark:nx-border-primary-100/10" />
          </>
        );
      }
      // Add class to `Back to home` to add a `::before` arrow icon
      if (title === "Back to home") {
        return (
          <>
            <span className="cursor-default back-to-home">{title}</span>
            <hr className="nx-mt-2 nx-border-t nx-border-gray-200 dark:nx-border-primary-100/10" />
          </>
        );
      }
      return <>{title}</>;
    },
    autoCollapse: true,
    defaultMenuCollapseLevel: 1,
    toggleButton: false,
  },
  // Use MDX frontmatter by rendering as the page header & description
  main: ({ children }) => {
    const { frontMatter } = useConfig();
    return (
      <>
        <h1 className="nx-mt-2 nx-text-4xl nx-font-bold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100">
          {frontMatter.title}
        </h1>
        <h2 className="nx-tracking-tight nx-text-slate-900 nx-mt-2 nx-mb-4 nx-text-2xl dark:nx-text-slate-100">
          {frontMatter.description}
        </h2>
        <hr className="dark:nx-border-neutral-800" />
        {children}
      </>
    );
  },
  // Force empty footer (it adds no value)
  footer: {
    component: () => null,
  },
  navbar: {
    // Custom navbar items, including a link to Twitter
    extraContent: (
      <>
        <a
          href="https://x.com/recallprotocol"
          target="_blank"
          rel="noreferrer"
          className="nx-p-2 nx-text-current"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
          </svg>
          <span className="nx-sr-only">X</span>
          <span className="nx-sr-only nx-select-none">(opens in a new tab)</span>
        </a>
      </>
    ),
  },
  toc: {
    backToTop: true,
  },
};

export default config;
