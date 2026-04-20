"use client";

function PolicySection({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-baseline gap-3.5 pb-3 border-b border-foreground mb-4">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">{num} /</span>
        <h2 className="font-heading font-semibold text-[18px] leading-none text-foreground">
          {title}
        </h2>
      </div>
      <div className="text-[14px] text-foreground leading-[1.65] space-y-3">{children}</div>
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-accent font-mono text-[11px] shrink-0 mt-1">→</span>
  );
}

export function TermsView() {
  const lastUpdated = "April 20, 2026";

  return (
    <div className="min-h-full">
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Legal</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Terms of Use</span>
        </div>
        <div className="field">
          <span className="field-label">Rev</span>
          <span className="field-value">{lastUpdated}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Drawn by</span>
          <span className="field-value">R.H.</span>
        </div>
      </div>

      <section className="container mx-auto max-w-[720px] px-4 sm:px-6 lg:px-16 py-14">
        <div className="pb-5 border-b border-foreground mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            Legal · Terms
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[40px] leading-[1.05] text-foreground">
            Terms of Use
          </h1>
          <p className="font-heading italic text-[15px] text-muted-foreground mt-3">
            Last updated · <span className="tabular-nums">{lastUpdated}</span>
          </p>
        </div>

        <PolicySection num="01" title="The short version">
          <p>
            Use the site in good faith. Don&apos;t post garbage, don&apos;t
            harass anyone, don&apos;t break the law. If you do, I&apos;ll
            remove the content and the account. The site is provided as-is
            with no warranty.
          </p>
        </PolicySection>

        <PolicySection num="02" title="What this is">
          <p>
            BASidekick is a community reference, news feed, and forum for
            people who work in building-automation systems. Reading is free
            and requires no account. Posting and commenting require an
            account.
          </p>
        </PolicySection>

        <PolicySection num="03" title="Your account">
          <p>
            You&apos;re responsible for keeping your login credentials secure
            and for anything posted from your account. If you think
            someone&apos;s gotten into your account, email me immediately at{" "}
            <a
              href="mailto:rob@basidekick.com"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              rob@basidekick.com
            </a>
            .
          </p>
          <p>One human, one account. No bots, no impersonation.</p>
        </PolicySection>

        <PolicySection num="04" title="How to behave">
          <p>Short list. Apply common sense to the rest.</p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2">
              <Arrow />
              <span>Be civil. No harassment, slurs, or targeted abuse.</span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>No spam, SEO content, or low-effort self-promotion.</span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>
                Don&apos;t post confidential client info, proprietary vendor
                materials you don&apos;t have rights to, or personally
                identifying information about anyone.
              </span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>
                Don&apos;t post anything illegal — threats, copyrighted
                material you don&apos;t own, etc.
              </span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>Don&apos;t try to break the site. You know the kind of thing.</span>
            </li>
          </ul>
        </PolicySection>

        <PolicySection num="05" title="Your content">
          <p>
            You own what you post. By posting it here you grant BASidekick a
            non-exclusive license to display, store, and serve your content
            so the site can, y&apos;know, work. That license ends when you
            delete the content or the account.
          </p>
          <p>
            Contributions to the Atlas (point and equipment definitions)
            become part of the open reference under whatever license the
            Atlas repository publishes. Contributions to open-source
            repositories follow that repo&apos;s license.
          </p>
        </PolicySection>

        <PolicySection num="06" title="Moderation">
          <p>
            I can remove any content or account that breaks these rules, and
            I don&apos;t have to explain why beyond a reasonable heads-up.
            Reports go through the &quot;Report&quot; button on posts and
            comments; I review them myself.
          </p>
        </PolicySection>

        <PolicySection num="07" title="No warranty">
          <p>
            The site and everything on it is provided &quot;as is&quot;. I try
            to keep information accurate and the site running, but I
            don&apos;t guarantee either. Don&apos;t use anything here as a
            substitute for engineering judgement, manufacturer documentation,
            or code compliance.
          </p>
        </PolicySection>

        <PolicySection num="08" title="Liability">
          <p>
            To the extent allowed by law, BASidekick and Rob Hansen aren&apos;t
            liable for any indirect, incidental, or consequential damages
            arising from your use of the site or the information on it.
          </p>
        </PolicySection>

        <PolicySection num="09" title="Changes">
          <p>
            If these terms change, the &quot;Last updated&quot; date will
            change too. Material changes get a PointStack post so signed-in
            users see them.
          </p>
        </PolicySection>

        <PolicySection num="10" title="Contact">
          <p>
            Questions, disputes, or legal notices go to{" "}
            <a
              href="mailto:rob@basidekick.com"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              rob@basidekick.com
            </a>
            .
          </p>
        </PolicySection>
      </section>
    </div>
  );
}
