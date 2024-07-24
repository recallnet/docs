import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const config: DocsThemeConfig = {
  logo: (
    <>
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M14.683 14.828a4.055 4.055 0 0 1-1.272.858a4.002 4.002 0 0 1-4.875-1.45l-1.658 1.119a6.063 6.063 0 0 0 1.621 1.62a5.963 5.963 0 0 0 2.148.903a6.035 6.035 0 0 0 3.542-.35a6.048 6.048 0 0 0 1.907-1.284c.272-.271.52-.571.734-.889l-1.658-1.119a4.147 4.147 0 0 1-.489.592z M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.514 2 12 2zm0 2c2.953 0 5.531 1.613 6.918 4H5.082C6.469 5.613 9.047 4 12 4zm0 16c-4.411 0-8-3.589-8-8c0-.691.098-1.359.264-2H5v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1h.736c.166.641.264 1.309.264 2c0 4.411-3.589 8-8 8z"
        />
      </svg>
      <span style={{ marginLeft: ".4em", fontWeight: 800 }}>Hoku docs</span>
    </>
  ),
  project: {
    link: "https://github.com/todo/adm",
  },
  darkMode: true,
  chat: {
    link: "https://discord.com/todo",
  },
  docsRepositoryBase: "https://github.com/todo/docs",
  editLink: {
    text: "Edit this page on GitHub →",
  },
  feedback: {
    content: "Question? Give us feedback →",
    labels: "feedback",
  },
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/") {
      return {
        titleTemplate: "%s – Hoku docs",
      };
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="description"
        content="Hoku docs: the official documentation for the Hoku protocol"
      />
      <meta
        name="og:title"
        content="Hoku docs: the official documentation for the Hoku protocol"
      />
      <link rel="icon" href="/img/favicon.ico" />
    </>
  ),
  sidebar: {
    titleComponent({ title, type, route }) {
      const { asPath } = useRouter();

      if (
        asPath === "/home" ||
        asPath === "/features" ||
        asPath === "/introduction"
      ) {
        if (type === "separator") {
          return (
            <>
              <span className="cursor-default">{title}</span>
              <hr className="nx-mt-2 nx-border-t nx-border-gray-200 dark:nx-border-primary-100/10" />
            </>
          );
        }
        return <>{title}</>;
      } else {
        if (type === "landing-page") {
          return (
            <>
              <span className="cursor-default">pp{title}</span>
              <hr className="nx-mt-2 nx-border-t nx-border-gray-200 dark:nx-border-primary-100/10" />
            </>
          );
        }
        if (type === "separator") {
          return (
            <>
              <span className="cursor-default">{title}</span>
              <hr className="nx-mt-2 nx-border-t nx-border-gray-200 dark:nx-border-primary-100/10" />
            </>
          );
        }
        return <>{title}</>;
      }
    },
    autoCollapse: true,
    defaultMenuCollapseLevel: 1,
    toggleButton: false,
  },
  footer: {
    text: (
      <div className="flex w-full flex-col items-center sm:items-start">
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} Hoku Contributors
        </p>
      </div>
    ),
  },
  navbar: {
    // Custom navbar items, including a link to Twitter
    extraContent: (
      <>
        <a
          href="https://twitter.com/textileio"
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
          <span className="nx-sr-only nx-select-none">
            {" "}
            (opens in a new tab)
          </span>
        </a>
      </>
    ),
  },
  toc: {
    backToTop: true,
  },
};

export default config;
