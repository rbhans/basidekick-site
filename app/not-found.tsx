import Link from "next/link";

const RECOVERY_LINKS = [
  { href: "/wiki", label: "Wiki", desc: "Long-form guides & explainers" },
  { href: "/atlas", label: "Atlas", desc: "Point & equipment reference" },
  { href: "/news", label: "News", desc: "BAS industry, curated" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-[560px]">
        <div className="font-mono text-[11px] uppercase tracking-[1.5px] text-ink-3 mb-6">
          <span className="text-punch">404 /</span> Not found
        </div>
        <h1 className="font-heading font-semibold text-[30px] md:text-[36px] leading-[1.1] text-ink italic mb-3">
          This drawing isn&apos;t in the set.
        </h1>
        <p className="text-[15px] leading-[1.7] text-ink-2 mb-10 max-w-[46ch]">
          The page you asked for doesn&apos;t exist, or it moved. Here&apos;s where most
          people are headed.
        </p>

        <div className="border-t border-[var(--sand-line)]">
          {RECOVERY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-baseline gap-4 py-4 border-b border-[var(--sand-line)] hover:bg-[var(--sand-2)] transition-colors -mx-2 px-2"
            >
              <span className="font-heading font-semibold text-[17px] text-ink group-hover:text-punch transition-colors">
                {link.label}
              </span>
              <span className="font-sans text-[13px] text-ink-3">{link.desc}</span>
              <span className="ml-auto font-mono text-[13px] text-ink-3 group-hover:text-punch group-hover:translate-x-0.5 transition-all">
                →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mt-8 font-mono text-[11px] uppercase tracking-[1.2px] text-ink-2 hover:text-punch transition-colors"
        >
          <span className="text-punch">←</span> Back to the homepage
        </Link>
      </div>
    </div>
  );
}
