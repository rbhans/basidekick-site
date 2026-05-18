interface ColophonProps {
  /** Optional context-specific lead text shown in the left column. */
  lead?: React.ReactNode;
  /** Optional override for the middle column copy. */
  body?: React.ReactNode;
  /** Optional ISO date string for the "Last reviewed" stamp. Defaults to today. */
  lastReviewed?: string;
}

const DEFAULT_LEAD = (
  <>
    <b>BASidekick</b>
    <br />
    Curated by Rob
    <br />
    <em>Independent</em> of any vendor
  </>
);

const DEFAULT_BODY = (
  <>
    Sources: Project Haystack, Brick Schema, vendor docs, CISA advisories, and community submissions. Every entry shows where the name came from — no canon without a citation.
  </>
);

export function Colophon({ lead, body, lastReviewed }: ColophonProps = {}) {
  const reviewedDate = lastReviewed ? new Date(lastReviewed) : new Date();
  const reviewedLabel = reviewedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="colophon">
      <div className="colophon-inner">
        <div>{lead ?? DEFAULT_LEAD}</div>
        <div>{body ?? DEFAULT_BODY}</div>
        <div className="right">
          Last reviewed · {reviewedLabel}
          <br />
          <a
            href="https://github.com/rbhans"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--ink)", borderBottom: "1px solid var(--punch)" }}
          >
            View sources on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
