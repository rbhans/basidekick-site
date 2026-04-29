import Link from "next/link";

export function Footer() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const legalLinkClass =
    "text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors";

  return (
    <footer className="border-t border-border bg-secondary mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_220px] gap-10 font-mono text-[12px] text-muted-foreground leading-relaxed">
          {/* Left: who built it */}
          <div>
            <strong className="text-foreground font-bold">BASidekick</strong>
            <br />
            Built and maintained by
            <br />
            Rob, Tucson
          </div>

          {/* Middle: open source statement + contact */}
          <div>
            Open source where it matters. Pull requests welcome on every public repo.
            <br />
            <a
              href="https://rbhans.github.io"
              target="_blank"
              rel="noreferrer"
              className={legalLinkClass}
            >
              rbhans.github.io
            </a>
            {" · "}
            <a
              href="mailto:rob@basidekick.com"
              className={legalLinkClass}
            >
              rob@basidekick.com
            </a>
          </div>

          {/* Right: last updated + legal */}
          <div className="md:text-right space-y-2">
            <div>Last updated · {lastUpdated}</div>
            <div>
              <Link href="/privacy" className={legalLinkClass}>
                Privacy
              </Link>
              {" · "}
              <Link href="/terms" className={legalLinkClass}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
