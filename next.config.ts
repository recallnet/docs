import { createMDX } from "fumadocs-mdx/next";
import { NextConfig } from "next";
import redirects from "./redirects.json";

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
async redirects() {
    return redirects as Array<{
      source: string;
      destination: string;
      permanent: boolean;
    }>;
  },
};

export default withMDX(config);
