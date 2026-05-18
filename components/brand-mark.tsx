interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <span className={`inline-block ${className}`} style={{ width: 38, height: 22 }} aria-hidden="true">
      <svg viewBox="0 0 32 18" fill="none" className="block w-full h-full">
        <rect x="0" y="0" width="32" height="18" fill="var(--punch)" rx="2" />
        <rect x="3" y="6" width="6" height="6" fill="var(--sand)" rx="1" />
        <path
          d="M10 9 H17 M15 6.5 L17.5 9 L15 11.5"
          stroke="var(--sand)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect x="19.5" y="2.5" width="10" height="13" fill="none" stroke="var(--sand)" strokeWidth="1.6" rx="1.5" />
      </svg>
    </span>
  );
}
