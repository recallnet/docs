import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./docs/**/*.mdx",
  ],
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
