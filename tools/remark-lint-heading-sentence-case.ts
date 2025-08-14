import type { Heading, Root } from "mdast";
import { toString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";

import { ALLOWED_CAPITALIZED_WORDS } from "./constants";

// A remark‑lint plugin: it walks all `heading` nodes and
// complains if they don't follow Sentence case.
const remarkLintHeadingSentenceCase: Plugin<[], Root> = () => {
  return (tree: Root, file: VFile) => {
    visit(tree, "heading", (node: Heading) => {
      const text = toString(node);
      if (!text) return;

      // Skip certain types of text
      if (shouldSkipText(text)) return;

      // Handle frontmatter titles
      if (processFrontmatterTitle(text, file, node)) return;

      // Handle numbered headings
      if (handleNumberedHeading(text, file, node)) return;

      // Handle regular headings
      handleRegularHeading(text, file, node);
    });
  };
};

/**
 * Check if a word should be allowed to remain capitalized
 */
function isAllowedCapitalizedWord(word: string): boolean {
  if (ALLOWED_CAPITALIZED_WORDS.includes(word)) return true;

  // Here you can define your custom logic to skip/handle words (e.g. with special characters)

  // Skip multi-level numbering patterns (e.g., "1.1", "1.1.1", "1.1.1.1")
  if (/^\d+(\.\d+)+$/.test(word)) {
    return true;
  }

  // Check clean word (without punctuation)
  const cleanWord = word.replace(/[^\w]/g, "");
  return ALLOWED_CAPITALIZED_WORDS.includes(cleanWord);
}

/**
 * Check sentence case for a list of words (first word should be capitalized, others lowercase unless allowed)
 */
function checkSentenceCase(words: string[], context: string, file: VFile, node: Heading): void {
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;

    if (isAllowedCapitalizedWord(word)) continue;

    if (/^[A-Z]/.test(word)) {
      file.message(
        `Only the first word of a sentence‑case heading may be capitalized (unless it's a proper noun or technical term): "${word}" in "${context}"`,
        node
      );
    }
  }
}

/**
 * Check if first character is uppercase
 */
function checkFirstCharacterCapitalized(
  text: string,
  context: string,
  file: VFile,
  node: Heading
): void {
  if (!/^[A-Z]/.test(text)) {
    file.message(
      `${context} should start with an uppercase letter (Sentence case): "${text}"`,
      node
    );
  }
}

/**
 * Handle numbered titles (e.g., "title: 5. Build the portfolio")
 */
function handleNumberedTitle(titleText: string, file: VFile, node: Heading): void {
  const numberedTitleMatch = titleText.match(/^(\d+)\.\s+(.+)$/);
  if (!numberedTitleMatch) return;

  const headingText = numberedTitleMatch[2];
  if (!headingText) return;

  // First character after number should be uppercase
  checkFirstCharacterCapitalized(
    headingText,
    "Title should have first letter capitalized after the number",
    file,
    node
  );

  // Check other words in the numbered title
  const words = headingText.split(/\s+/);
  checkSentenceCase(words, `title: ${titleText}`, file, node);
}

/**
 * Handle regular titles (sentence case)
 */
function handleRegularTitle(titleText: string, file: VFile, node: Heading): void {
  // First character must be uppercase
  checkFirstCharacterCapitalized(titleText, "Title", file, node);

  // Check other words for improper capitalization
  const words = titleText.split(/\s+/);
  checkSentenceCase(words, `title: ${titleText}`, file, node);
}

/**
 * Process frontmatter title field
 */
function processFrontmatterTitle(text: string, file: VFile, node: Heading): boolean {
  if (!text.includes("title:")) return false;

  const titleMatch = text.match(/title:\s*(.+?)(?:\n|$)/i);
  if (!titleMatch) return true; // Found title: but couldn't parse it

  let titleText = titleMatch[1]?.trim();
  if (!titleText) return true;

  // Remove quotes if present
  titleText = titleText.replace(/^["']|["']$/g, "");

  // Check if this is a numbered title
  const numberedTitleMatch = titleText.match(/^(\d+)\.\s+(.+)$/);

  if (numberedTitleMatch) {
    handleNumberedTitle(titleText, file, node);
  } else {
    handleRegularTitle(titleText, file, node);
  }

  return true; // Processed frontmatter
}

/**
 * Handle numbered headings (e.g., "## 5. Build the portfolio")
 */
function handleNumberedHeading(text: string, file: VFile, node: Heading): boolean {
  // Updated regex to support multi-level numbering with optional trailing dot: 1., 1.1., 1.1.1., 1.1, 1.1.1, etc.
  // Also supports &nbsp;· format: 1&nbsp;·, 1.1&nbsp;·, etc.
  const numberedHeadingMatch = text.match(/^(\d+(?:\.\d+)*)(?:\.?\s+|&nbsp;·\s*)(.+)$/);
  if (!numberedHeadingMatch) return false;

  const headingText = numberedHeadingMatch[2];
  if (!headingText) return true;

  // First character after number should be uppercase
  checkFirstCharacterCapitalized(
    headingText,
    "Numbered heading should have first letter capitalized after the number",
    file,
    node
  );

  // Check other words in the numbered heading
  const words = headingText.split(/\s+/);
  checkSentenceCase(words, text, file, node);

  return true; // Processed numbered heading
}

/**
 * Handle regular headings (sentence case)
 */
function handleRegularHeading(text: string, file: VFile, node: Heading): void {
  // First character must be uppercase
  checkFirstCharacterCapitalized(text, "Heading", file, node);

  // Check other words for improper capitalization
  const words = text.split(/\s+/);
  checkSentenceCase(words, text, file, node);
}

/**
 * Check if text should be skipped entirely
 */
function shouldSkipText(text: string): boolean {
  // Skip headings that are all caps (likely acronyms)
  if (text === text.toUpperCase()) return true;

  // Skip frontmatter description and keywords (but not title)
  if (text.includes("description:") || text.includes("keywords:")) return true;

  return false;
}

export default remarkLintHeadingSentenceCase;
