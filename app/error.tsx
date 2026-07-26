"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="status-page"><span className="eyebrow">WORKSPACE ERROR</span><h1>This pane did not load.</h1><p>Your session is safe. Retry the current view or return to the dashboard.</p><button className="button primary" onClick={reset}>Try again</button></main>;
}
