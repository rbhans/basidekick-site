export function Footer() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
            Rob Hansen, Tucson
          </div>

          {/* Middle: open source statement + contact */}
          <div>
            Open source where it matters. Pull requests welcome on every public repo.
            <br />
            <a
              href="https://github.com/rbhans"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              github.com/rbhans
            </a>
            {" · "}
            <a
              href="mailto:rob@basidekick.com"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              rob@basidekick.com
            </a>
          </div>

          {/* Right: last updated */}
          <div className="md:text-right">
            Last updated · {lastUpdated}
          </div>
        </div>
      </div>
    </footer>
  );
}
