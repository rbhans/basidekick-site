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

export function PrivacyView() {
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
          <span className="field-value">Privacy Policy</span>
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
            Privacy Policy
          </h1>
          <p className="italic text-[15px] text-muted-foreground mt-3">
            Last updated · <span className="tabular-nums">{lastUpdated}</span>
          </p>
        </div>

        <PolicySection num="01" title="The short version">
          <p>
            BASidekick is a one-person operation. I don&apos;t sell your data,
            share it with advertisers, or use it for anything beyond running
            the site. The account and community features need a little
            information to work — that&apos;s it.
          </p>
          <p>
            If you want your account and everything tied to it gone, email me at{" "}
            <a
              href="mailto:rob@basidekick.com"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              rob@basidekick.com
            </a>{" "}
            and I&apos;ll delete it.
          </p>
        </PolicySection>

        <PolicySection num="02" title="What the site collects">
          <p>Only what the features you use need to function:</p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2">
              <Arrow />
              <span>
                <strong className="font-semibold">Account:</strong> email
                address, optional display name, optional avatar. Used to sign
                you in and show you as the author of your posts.
              </span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>
                <strong className="font-semibold">PointStack activity:</strong>{" "}
                posts, comments, jobs, companies, endorsements, and
                bookmarks you create. These are public by design — that&apos;s
                the whole point of a community feed.
              </span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>
                <strong className="font-semibold">Session cookies:</strong>{" "}
                a standard auth cookie so you stay signed in. No tracking
                cookies.
              </span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>
                <strong className="font-semibold">Anonymous analytics:</strong>{" "}
                Vercel Analytics records aggregate page views. It doesn&apos;t
                use cookies and doesn&apos;t identify you personally.
              </span>
            </li>
          </ul>
        </PolicySection>

        <PolicySection num="03" title="What the site does NOT do">
          <ul className="space-y-2 pl-4">
            {[
              "Sell your data to anyone",
              "Share your data with advertisers",
              "Track you across other websites",
              "Build a marketing profile about you",
              "Use your posts to train AI models",
              "Email you marketing material",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Arrow />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </PolicySection>

        <PolicySection num="04" title="Where your data lives">
          <p>
            The site runs on a small, standard stack. Each service only sees
            what it needs to do its job:
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-2">
              <Arrow />
              <span>
                <strong className="font-semibold">Supabase</strong> — hosts the
                database and handles authentication. Your email, profile, and
                PointStack content are stored here.
              </span>
            </li>
            <li className="flex gap-2">
              <Arrow />
              <span>
                <strong className="font-semibold">Vercel</strong> — hosts the
                website and serves pages. Also provides the privacy-friendly
                analytics mentioned above.
              </span>
            </li>
          </ul>
          <p>
            That&apos;s the full list. No third-party trackers, ad networks,
            or data brokers.
          </p>
        </PolicySection>

        <PolicySection num="05" title="Public vs private">
          <p>
            Content you post to PointStack (posts, comments, jobs, company
            pages, endorsements, your display name and avatar) is{" "}
            <strong className="font-semibold">public</strong>. Anyone on the
            internet can see it, and search engines may index it. That&apos;s
            the nature of a community site — don&apos;t post anything you
            wouldn&apos;t want attached to your name.
          </p>
          <p>
            Your email address is{" "}
            <strong className="font-semibold">private</strong> and never shown
            to other users.
          </p>
        </PolicySection>

        <PolicySection num="06" title="Deleting your account">
          <p>
            Email{" "}
            <a
              href="mailto:rob@basidekick.com"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              rob@basidekick.com
            </a>{" "}
            from the address tied to your account. I&apos;ll delete your
            profile, posts, comments, endorsements, bookmarks, and any
            uploaded avatars. This is permanent and I can&apos;t recover it
            afterward.
          </p>
          <p>
            Self-service deletion is on the roadmap. Until then the email
            route is the official path.
          </p>
        </PolicySection>

        <PolicySection num="07" title="Kids">
          <p>
            BASidekick is for working adults in the building-automation
            industry. If you&apos;re under 13, don&apos;t create an account.
            If I find out an account belongs to a child, I&apos;ll delete it.
          </p>
        </PolicySection>

        <PolicySection num="08" title="Changes">
          <p>
            If this policy changes, the &quot;Last updated&quot; date at the
            top will change too. Anything that materially affects how your
            data is handled, I&apos;ll also flag in a PointStack post so
            signed-in users see it.
          </p>
        </PolicySection>

        <PolicySection num="09" title="Questions">
          <p>
            Email{" "}
            <a
              href="mailto:rob@basidekick.com"
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
            >
              rob@basidekick.com
            </a>
            . I read everything that comes in.
          </p>
        </PolicySection>
      </section>
    </div>
  );
}
