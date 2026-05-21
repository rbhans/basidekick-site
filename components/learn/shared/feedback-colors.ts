// Shared feedback color tokens for assessment + exploratory components.
// Exploratory components use these sparingly (mostly for state highlights).
// Assessment components use them for correctness signaling.

export const FEEDBACK = {
  correct: {
    fg: "var(--color-feedback-correct-fg)",
    bg: "var(--color-feedback-correct-bg)",
    border: "var(--color-feedback-correct-border)",
  },
  partial: {
    fg: "var(--color-feedback-partial-fg)",
    bg: "var(--color-feedback-partial-bg)",
    border: "var(--color-feedback-partial-border)",
  },
  incorrect: {
    fg: "var(--color-feedback-incorrect-fg)",
    bg: "var(--color-feedback-incorrect-bg)",
    border: "var(--color-feedback-incorrect-border)",
  },
} as const;

export type FeedbackKind = keyof typeof FEEDBACK;
