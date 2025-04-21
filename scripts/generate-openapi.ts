import { generateFiles } from "fumadocs-openapi";

const SPEC_PATH = "specs/trading-simulator.json";
const OUTPUT_PATH = "docs/api/competitions";
void generateFiles({
  input: [SPEC_PATH],
  output: OUTPUT_PATH,
  per: "tag",
});
