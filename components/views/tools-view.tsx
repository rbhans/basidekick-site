export function ToolsView() {
  return (
    <div className="min-h-full">
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Tools</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Built for BAS Professionals</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Status</span>
          <span className="field-value">Coming soon</span>
        </div>
      </div>

      <section className="container mx-auto max-w-[760px] px-4 sm:px-6 lg:px-16 py-24 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-accent mb-6">
          00 / Coming soon
        </div>
        <h1 className="font-heading font-semibold text-[36px] md:text-[48px] leading-[1.05] text-foreground mb-6">
          Tools are on the way.
        </h1>
        <p className="italic text-[17px] text-muted-foreground leading-[1.5] max-w-[560px] mx-auto">
          Professional software for building automation — one-time purchase, no subscriptions. Check back soon.
        </p>
      </section>
    </div>
  );
}
