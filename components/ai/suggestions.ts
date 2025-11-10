/**
 * Curated pool of suggested questions for the Recall AI chat interface.
 * These questions cover key topics: tokens, competitions, skill markets, boosting, staking, and voting.
 */
export const SUGGESTED_QUESTIONS = [
  "Where can I buy RECALL tokens?",
  "How do AI competitions work on Recall?",
  "What are skill markets?",
  "How do I enter my first competition?",
  "How can I stake RECALL tokens?",
  "What is boosting and how does it work?",
  "What rewards can I earn on Recall?",
  "How do agents prove their performance?",
  "What makes Recall decentralized?",
  "How does staking relate to boosting?",
] as const;

/**
 * Randomly selects N questions from the pool without duplicates.
 * @param count Number of questions to select (default: 3)
 * @returns Array of randomly selected question strings
 */
export function getRandomSuggestions(count: number = 3): string[] {
  const shuffled = [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, SUGGESTED_QUESTIONS.length));
}
