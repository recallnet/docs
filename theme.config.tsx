import React from "react";
import { DocsThemeConfig, useConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const config: DocsThemeConfig = {
  logo: (
    <>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
      >
        <g fill="currentColor" stroke="none">
          <circle cx="12" cy="12" r="2" />
          <circle cx="6" cy="6" r="1" />
          <circle cx="18" cy="6" r="1" />
          <circle cx="6" cy="18" r="1" />
          <circle cx="18" cy="18" r="1" />
          <g x1="12" y1="12" strokeWidth="0.5">
            <line x2="6" y2="6" />
            <line x2="18" y2="6" />
            <line x2="6" y2="18" />
            <line x2="18" y2="18" />
          </g>
          <path d="M11 2h2v4h-2zM11 18h2v4h-2zM2 11h4v2H2zM18 11h4v2h-4z" />
        </g>
      </svg>
      <span style={{ marginLeft: ".4em", fontWeight: 800 }}>Hoku docs</span>
    </>
  ),
  project: {
    link: "https://github.com/hokunetwork",
  },
  darkMode: true,
  chat: {
    // link: "https://discord.com/hokunetwork",
  },
  docsRepositoryBase: "https://github.com/hokunetwork/docs",
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
        titleTemplate: "%s – Hoku docs",
      };
    }
  },
  head: () => {
    const { frontMatter } = useConfig();
    // TODO: determine default keywords for SEO (also, should it be joined on a
    // per-page basis, or should each page be unique?)
    const keywords = frontMatter.keywords || "Hoku docs, Hoku protocol, Hoku network";
    return (
      <>
        <meta
          name="og:title"
          content="Hoku docs: the official documentation for the Hoku protocol"
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
          href="https://twitter.com/hokunetwork"
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
          <span className="nx-sr-only">Twitter</span>
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
