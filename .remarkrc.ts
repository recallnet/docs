import lint from "remark-lint";
import headingStyle from "remark-lint-heading-style";
import mdx from "remark-mdx";

import sentenceCase from "./tools/remark-lint-heading-sentence-case";

export default {
  plugins: [
    mdx, // parse .mdx
    lint, // enable linting
    [headingStyle, "atx"], // ensure all headings use `#` style
    sentenceCase, // our custom sentence‑case rule
  ],
};
