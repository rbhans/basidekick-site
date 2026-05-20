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

export function QRSidekickPrivacyView() {
  const lastUpdated = "January 12, 2025";

  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Legal</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">QR Sidekick · Privacy Policy</span>
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
            Legal · Privacy
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[40px] leading-[1.05] text-foreground">
            QR Sidekick Privacy Policy
          </h1>
          <p className="italic text-[15px] text-muted-foreground mt-3">
            Last updated · <span className="tabular-nums">{lastUpdated}</span>
          </p>
        </div>

        <PolicySection num="01" title="Introduction">
          <p>
            QR Sidekick is a mobile application that allows you to scan QR codes using your
            device&apos;s camera. We are committed to protecting your privacy and being transparent
            about our data practices.
          </p>
        </PolicySection>

        <PolicySection num="02" title="Camera access">
          <p>
            QR Sidekick requires access to your device&apos;s camera solely for the purpose of
            scanning QR codes. When you use the app:
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2">
              <span className="text-accent font-mono text-[11px] shrink-0 mt-1">→</span>
              Camera images are processed entirely on your device
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-mono text-[11px] shrink-0 mt-1">→</span>
              No images or camera data are ever transmitted to external servers
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-mono text-[11px] shrink-0 mt-1">→</span>
              No images or camera data are stored permanently
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-mono text-[11px] shrink-0 mt-1">→</span>
              Camera access is only active while you are actively scanning
            </li>
          </ul>
        </PolicySection>

        <PolicySection num="03" title="Data collection">
          <p>
            <strong className="font-heading font-semibold">
              We do not collect any personal data.
            </strong>
          </p>
          <p>QR Sidekick does not:</p>
          <ul className="space-y-2 pl-4">
            {[
              "Collect personal information",
              "Track your location",
              "Record your scanning history",
              "Use analytics or tracking services",
              "Share any data with third parties",
              "Require account creation or login",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-accent font-mono text-[11px] shrink-0 mt-1">→</span>
                {item}
              </li>
            ))}
          </ul>
        </PolicySection>

        <PolicySection num="04" title="Data storage">
          <p>
            All data processed by QR Sidekick remains on your device. We do not operate servers
            that store user data. The app functions entirely offline after installation.
          </p>
        </PolicySection>

        <PolicySection num="05" title="Third-party services">
          <p>
            QR Sidekick does not integrate with any third-party analytics, advertising, or
            tracking services. The app contains no ads and makes no network requests.
          </p>
        </PolicySection>

        <PolicySection num="06" title="Children's privacy">
          <p>
            Because QR Sidekick does not collect any data from any user, it is compliant with
            the Children&apos;s Online Privacy Protection Act (COPPA) and similar regulations.
          </p>
        </PolicySection>

        <PolicySection num="07" title="Changes to this policy">
          <p>
            If we make changes to this privacy policy, we will update the &quot;Last updated&quot;
            date at the top of this page. We encourage you to review this policy periodically.
          </p>
        </PolicySection>

        <PolicySection num="08" title="Contact us">
          <p>
            If you have any questions about this privacy policy or QR Sidekick&apos;s privacy
            practices, please contact us at{" "}
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
