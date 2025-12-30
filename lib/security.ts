/**
 * Security utilities for input sanitization, validation, and safe data handling
 */

// Maximum lengths for user content
export const MAX_LENGTHS = {
  SEARCH_QUERY: 200,
  COMMENT: 10000,
  POST_CONTENT: 50000,
  THREAD_TITLE: 200,
  DISPLAY_NAME: 30,
} as const;

// Minimum lengths for user content
export const MIN_LENGTHS = {
  DISPLAY_NAME: 3,
} as const;

/**
 * Profanity word list for content filtering
 * Uses word boundary matching to avoid false positives
 */
const PROFANITY_LIST: string[] = [
  // Common offensive terms
  "fuck", "shit", "ass", "bitch", "cunt", "dick", "cock", "pussy",
  "bastard", "damn", "piss", "slut", "whore",
  // Slurs and hate speech
  "fag", "faggot", "nigger", "nigga", "retard", "retarded",
  // Leetspeak variations
  "f*ck", "sh*t", "b*tch", "c*nt", "d*ck",
  "f**k", "a$$", "b!tch", "sh!t",
  "fuk", "fck", "sht", "btch",
];

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if text contains profanity
 * Uses word boundary matching to avoid false positives (e.g., "assassin", "class")
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  return PROFANITY_LIST.some((word) => {
    // Create regex with word boundaries
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
    return regex.test(lowerText);
  });
}

/**
 * Validate display name with length and profanity checks
 */
export function validateDisplayName(
  displayName: string
): { valid: boolean; sanitized: string; error?: string } {
  if (!displayName || typeof displayName !== "string") {
    return { valid: false, sanitized: "", error: "Display name is required" };
  }

  const trimmed = displayName.trim();

  // Length validation
  if (trimmed.length < MIN_LENGTHS.DISPLAY_NAME) {
    return {
      valid: false,
      sanitized: trimmed,
      error: `Display name must be at least ${MIN_LENGTHS.DISPLAY_NAME} characters`,
    };
  }

  if (trimmed.length > MAX_LENGTHS.DISPLAY_NAME) {
    return {
      valid: false,
      sanitized: trimmed.slice(0, MAX_LENGTHS.DISPLAY_NAME),
      error: `Display name cannot exceed ${MAX_LENGTHS.DISPLAY_NAME} characters`,
    };
  }

  // Profanity check
  if (containsProfanity(trimmed)) {
    return {
      valid: false,
      sanitized: trimmed,
      error: "Display name contains inappropriate language",
    };
  }

  // Character validation (alphanumeric, spaces, underscores, hyphens)
  const validCharsRegex = /^[a-zA-Z0-9\s_-]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return {
      valid: false,
      sanitized: trimmed,
      error: "Display name can only contain letters, numbers, spaces, underscores, and hyphens",
    };
  }

  // Remove control characters
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, "");

  return { valid: true, sanitized };
}

/**
 * Sanitize search input for use in Supabase ILIKE queries
 * Escapes PostgreSQL LIKE special characters: %, _, \
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Trim and limit length
  let sanitized = input.trim().slice(0, MAX_LENGTHS.SEARCH_QUERY);

  // Escape PostgreSQL LIKE special characters
  sanitized = sanitized
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/%/g, "\\%")   // Escape percent signs
    .replace(/_/g, "\\_");  // Escape underscores

  // Remove any null bytes or control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

  return sanitized;
}

/**
 * Escape string for safe inclusion in JSON-LD script tags
 * Prevents script tag injection via </script> sequences
 */
export function escapeJsonLd(obj: unknown): string {
  const json = JSON.stringify(obj);
  // Escape </script> sequences that could break out of JSON-LD
  return json
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--");
}

/**
 * Validate and sanitize user-generated content (posts, comments)
 */
export function validateContent(
  content: string,
  maxLength: number = MAX_LENGTHS.POST_CONTENT
): { valid: boolean; sanitized: string; error?: string } {
  if (!content || typeof content !== "string") {
    return { valid: false, sanitized: "", error: "Content is required" };
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { valid: false, sanitized: "", error: "Content cannot be empty" };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      sanitized: trimmed.slice(0, maxLength),
      error: `Content exceeds maximum length of ${maxLength} characters`,
    };
  }

  // Remove null bytes and control characters (except newlines/tabs)
  const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return { valid: true, sanitized };
}

/**
 * Validate thread/article title
 */
export function validateTitle(
  title: string,
  maxLength: number = MAX_LENGTHS.THREAD_TITLE
): { valid: boolean; sanitized: string; error?: string } {
  if (!title || typeof title !== "string") {
    return { valid: false, sanitized: "", error: "Title is required" };
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { valid: false, sanitized: "", error: "Title cannot be empty" };
  }

  if (trimmed.length < 3) {
    return { valid: false, sanitized: trimmed, error: "Title must be at least 3 characters" };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      sanitized: trimmed.slice(0, maxLength),
      error: `Title exceeds maximum length of ${maxLength} characters`,
    };
  }

  // Remove control characters
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, "");

  return { valid: true, sanitized };
}

/**
 * Simple client-side rate limiting using localStorage
 * Returns true if the action should be allowed
 */
export function checkRateLimit(
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean {
  if (typeof window === "undefined") return true;

  const key = `ratelimit_${action}`;
  const now = Date.now();

  try {
    const stored = localStorage.getItem(key);
    const attempts: number[] = stored ? JSON.parse(stored) : [];

    // Filter to only recent attempts within the window
    const recentAttempts = attempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    // Add current attempt and save
    recentAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(recentAttempts));

    return true;
  } catch {
    // If localStorage fails, allow the action
    return true;
  }
}

/**
 * Get time until rate limit resets (in seconds)
 */
export function getRateLimitReset(action: string, windowMs: number = 60000): number {
  if (typeof window === "undefined") return 0;

  const key = `ratelimit_${action}`;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return 0;

    const attempts: number[] = JSON.parse(stored);
    if (attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + windowMs;
    const remaining = Math.ceil((resetTime - Date.now()) / 1000);

    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}
