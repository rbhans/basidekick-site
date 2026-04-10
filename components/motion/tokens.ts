export const duration = {
  fast: 0.15,
  normal: 0.4,
  slow: 0.6,
} as const;

export const ease = {
  out: [0.25, 0.46, 0.45, 0.94] as const,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
} as const;

export const stagger = {
  default: 0.08,
} as const;

export const distance = {
  reveal: 20,
} as const;
