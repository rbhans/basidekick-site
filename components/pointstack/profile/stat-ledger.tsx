"use client";

interface StatLedgerProps {
  reputation: number;
  contributions: number;
  solutions: number;
  followers: number;
  following: number;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}

interface Cell {
  key: string;
  label: string;
  value: number;
  onClick?: () => void;
}

function formatStat(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function StatLedger({
  reputation,
  contributions,
  solutions,
  followers,
  following,
  onShowFollowers,
  onShowFollowing,
}: StatLedgerProps) {
  const cells: Cell[] = [
    { key: "rep", label: "Reputation", value: reputation },
    ...(contributions > 0 ? [{ key: "contrib", label: "Contributions", value: contributions }] : []),
    ...(solutions > 0 ? [{ key: "sol", label: "Solutions", value: solutions }] : []),
    { key: "followers", label: "Followers", value: followers, onClick: onShowFollowers },
    { key: "following", label: "Following", value: following, onClick: onShowFollowing },
  ];

  const baseCls =
    "flex flex-1 basis-[130px] flex-col gap-1 border-r border-[var(--sand-line)] px-4 py-3.5 text-left last:border-r-0 max-[680px]:basis-[50%] max-[680px]:border-b";

  return (
    <div className="mt-4 flex flex-wrap overflow-hidden rounded-md border border-[var(--sand-line-2)] bg-card tabular-nums">
      {cells.map((c) => {
        const inner = (
          <>
            <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-ink-3">
              {c.label}
            </span>
            <span className="font-heading text-[22px] font-bold leading-none tracking-[-0.01em] text-ink">
              {formatStat(c.value)}
            </span>
          </>
        );
        return c.onClick ? (
          <button key={c.key} type="button" onClick={c.onClick} className={`${baseCls} transition-colors hover:bg-card-2`}>
            {inner}
          </button>
        ) : (
          <div key={c.key} className={baseCls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
