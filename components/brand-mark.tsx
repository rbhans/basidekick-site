type BrandMarkSize = "xs" | "sm" | "md" | "lg" | "xl";
type BrandMarkVariant = "default" | "mono" | "inverse";

const SIZES: Record<BrandMarkSize, { width: number; height: number }> = {
  xs: { width: 24, height: 14 },
  sm: { width: 32, height: 18 },
  md: { width: 38, height: 22 },
  lg: { width: 56, height: 32 },
  xl: { width: 96, height: 54 },
};

interface BrandMarkProps {
  className?: string;
  /** Size token. Default `md` (38×22). */
  size?: BrandMarkSize;
  /**
   * Color variant:
   * - `default` — crimson card, cream cutouts (use everywhere)
   * - `mono` — ink card, cream outlined cutouts (print, fax, CMYK)
   * - `inverse` — cream card, crimson cutouts (only on full-bleed crimson)
   */
  variant?: BrandMarkVariant;
}

export function BrandMark({
  className = "",
  size = "md",
  variant = "default",
}: BrandMarkProps) {
  const { width, height } = SIZES[size];
  const card = variant === "default" ? "var(--punch)" : variant === "mono" ? "var(--ink)" : "var(--sand)";
  const ink = variant === "inverse" ? "var(--punch)" : "var(--sand)";
  const cutoutFill = variant === "mono" ? "none" : ink;
  const cutoutStroke = variant === "mono" ? "var(--sand)" : ink;

  return (
    <span
      className={`inline-block ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 18" fill="none" className="block w-full h-full">
        <rect x="0" y="0" width="32" height="18" fill={card} rx="2" />
        <rect
          x="3"
          y="6"
          width="6"
          height="6"
          fill={cutoutFill}
          stroke={variant === "mono" ? cutoutStroke : "none"}
          strokeWidth={variant === "mono" ? 1.4 : 0}
          rx="1"
        />
        <path
          d="M10 9 H17 M15 6.5 L17.5 9 L15 11.5"
          stroke={cutoutStroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect
          x="19.5"
          y="2.5"
          width="10"
          height="13"
          fill="none"
          stroke={cutoutStroke}
          strokeWidth="1.6"
          rx="1.5"
        />
      </svg>
    </span>
  );
}

/**
 * BrandMark + "BASidekick" wordmark, horizontal lockup. Use for headers,
 * email signatures, and any place the wordmark needs to appear alongside
 * the mark. Inherits current text color — wrap in a color-setting span
 * if you need to override (e.g. on dark surfaces).
 */
export function BrandLockup({
  className = "",
  size = "md",
  variant = "default",
}: BrandMarkProps) {
  const wordmarkSize = size === "xs" ? 14 : size === "sm" ? 16 : size === "md" ? 18 : size === "lg" ? 26 : 44;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={size} variant={variant} />
      <span
        className="font-sans font-extrabold tracking-[-0.005em] text-current"
        style={{ fontSize: wordmarkSize, lineHeight: 1 }}
      >
        BASidekick
      </span>
    </span>
  );
}
