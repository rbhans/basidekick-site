"use client";

import { useEffect, useState } from "react";

export function SidebarFooter() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-3 py-3 border-t border-border bg-card/50">
      {/* Station info header */}
      <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
        Station Info
      </div>

      {/* Info grid */}
      <div className="space-y-1 text-[10px] font-mono text-muted-foreground">
        <div className="flex justify-between">
          <span className="text-muted-foreground/60">Station:</span>
          <span>basidekick-01</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground/60">Host:</span>
          <span>localhost</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground/60">License:</span>
          <span className="text-emerald-500">Active</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground/60">Version:</span>
          <span>v1.0.0-beta</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-2 border-t border-border/50" />

      {/* Timestamp */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-muted-foreground/60">{date}</span>
        <span className="text-primary font-medium tabular-nums">{time}</span>
      </div>
    </div>
  );
}
