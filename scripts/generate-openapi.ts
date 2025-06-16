import { generateFiles } from "fumadocs-openapi";

const SPEC_PATH = "specs/competitions.json";
const OUTPUT_PATH = "docs/api-reference/endpoints";
void generateFiles({
  input: [SPEC_PATH],
  output: OUTPUT_PATH,
  per: "tag",
});
