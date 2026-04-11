interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  className?: string;
}

const sizes = {
  sm: "text-[18px]",
  md: "text-[22px]",
  lg: "text-[32px]",
  xl: "text-[48px]",
};

export function BrandLogo({
  size = "md",
  variant = "light",
  className = "",
}: BrandLogoProps) {
  const accentColor = "var(--accent)";        // #c08621 gold
  const baseColor =
    variant === "light"
      ? "var(--foreground)"                    // #1f2920 dark sage
      : "var(--primary-foreground)";           // #f1efe6 parchment

  return (
    <span
      className={`font-heading italic font-semibold tracking-tight select-none ${sizes[size]} ${className}`}
      aria-label="BASidekick"
    >
      <span style={{ color: accentColor }}>BA</span>
      <span style={{ color: baseColor }}>Sidekick</span>
    </span>
  );
}
