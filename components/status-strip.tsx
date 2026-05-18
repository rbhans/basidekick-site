"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface StatusStripProps {
  version: string;
  buildTime: string;
}

function formatUtc(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export function StatusStrip({ version, buildTime }: StatusStripProps) {
  const buildDate = new Date(buildTime);
  const [utc, setUtc] = useState<string>(() => formatUtc(new Date()));
  const [builtAgo, setBuiltAgo] = useState<string>(() =>
    formatDistanceToNow(buildDate, { addSuffix: false }),
  );

  useEffect(() => {
    const tick = () => {
      setUtc(formatUtc(new Date()));
      setBuiltAgo(formatDistanceToNow(buildDate, { addSuffix: false }));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [buildTime]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="strip" role="status" aria-label="Site status">
      <div className="bsk-wrap strip-inner">
        <span>
          <span className="dot" aria-hidden="true" />
          SYS <b>NOMINAL</b>
        </span>
        <span className="sep" aria-hidden="true" />
        <span>
          BUILD <b>v{version}</b>
        </span>
        <span className="right">
          <span>
            FEED <b>OK</b>
          </span>
          <span className="sep" aria-hidden="true" />
          <span suppressHydrationWarning>
            BUILT <b>{builtAgo}</b> AGO
          </span>
          <span className="sep" aria-hidden="true" />
          <span suppressHydrationWarning>
            UTC <b>{utc}</b>
          </span>
        </span>
      </div>
    </div>
  );
}
