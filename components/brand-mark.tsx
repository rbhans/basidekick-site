type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "" }: BrandMarkProps) {
  const classes = ["brandmark", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={classes}
      viewBox="0 0 32 18"
      width="32"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="brandmark-card" width="32" height="18" rx="2" fill="#d11a36" />
      <rect className="brandmark-source" x="3.25" y="6.2" width="5.6" height="5.6" rx="0.9" fill="#fafaf8" />
      <path
        className="brandmark-arrow"
        d="M10.1 9 H16.7 M14.45 6.8 L16.75 9 L14.45 11.2"
        stroke="#fafaf8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect
        className="brandmark-target"
        x="19.8"
        y="2.75"
        width="9.2"
        height="12.5"
        rx="1.3"
        fill="none"
        stroke="#fafaf8"
        strokeWidth="1.5"
      />
    </svg>
  );
}
