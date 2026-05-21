"use client";

import { motion } from "motion/react";

interface ZoneTempChartProps {
  /** Label shown above the chart. */
  title?: string;
  /** Setpoint line value in °F. */
  setpoint?: number;
  /** Optional annotation marker on the peak day. */
  annotation?: string;
}

/**
 * Synthetic week of zone-temperature samples. 24 samples per day, 7 days.
 * Setpoint = 72°F. Mid-day excursions grow through the week (the kind of
 * trend that prompts a complaint by Friday afternoon).
 */
function makeSeries(): number[] {
  const out: number[] = [];
  // Day-by-day peak climbs toward Friday afternoon, then trails off through the weekend.
  // Overnight floor stays near 68. Friday is the highest excursion — the day the complaint lands.
  const peaks = [73, 73.5, 74.5, 75.5, 79, 76, 74];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      // Cosine wave anchored at peak around 3pm
      const phase = (h - 15) / 8;
      const day = 68 + (peaks[d] - 68) * Math.max(0, Math.cos(phase * 1.2));
      // Small noise for realism (deterministic)
      const noise = Math.sin(d * 7 + h * 1.7) * 0.15;
      out.push(+(day + noise).toFixed(2));
    }
  }
  return out;
}

const SERIES = makeSeries();
const MIN_F = 66;
const MAX_F = 82;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ZoneTempChart({
  title = "ZN_TEMP · 4th floor SE corner",
  setpoint = 72,
  annotation = "Friday 3:14pm · operator complaint",
}: ZoneTempChartProps) {
  const W = 720;
  const H = 240;
  const PAD_L = 44;
  const PAD_R = 16;
  const PAD_T = 32;
  const PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xFor = (i: number) => PAD_L + (i / (SERIES.length - 1)) * innerW;
  const yFor = (v: number) =>
    PAD_T + ((MAX_F - v) / (MAX_F - MIN_F)) * innerH;

  // Path string
  const path = SERIES.map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`)
    .join(" ");

  // Find Friday 3pm peak index (day=4, h=15)
  const peakI = 4 * 24 + 15;
  const peakX = xFor(peakI);
  const peakY = yFor(SERIES[peakI]);

  return (
    <figure className="my-10 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-3">
      <p className="px-3 pb-2 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        {title}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label={`Trend chart for ${title}. Setpoint ${setpoint}°F. Friday afternoon peaks near 79°F.`}
      >
        {/* Y axis ticks */}
        {[68, 72, 76, 80].map((v) => (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="currentColor"
              strokeWidth={v === setpoint ? 1 : 0.5}
              strokeDasharray={v === setpoint ? "4 4" : "0"}
              className={
                v === setpoint
                  ? "text-[color:var(--color-accent-strong)]"
                  : "text-[color:var(--color-border)]"
              }
              opacity={v === setpoint ? 1 : 0.6}
            />
            <text
              x={PAD_L - 8}
              y={yFor(v) + 3}
              fontSize="10"
              textAnchor="end"
              className="fill-[color:var(--color-fg-subtle)]"
            >
              {v}°F
            </text>
          </g>
        ))}

        {/* Setpoint label intentionally not drawn inside the SVG — keeps the
            chart area clean of overlapping text. Caption below the SVG names
            the dashed line. */}

        {/* X axis day labels */}
        {DAYS.map((d, i) => {
          const center = xFor(i * 24 + 12);
          return (
            <g key={d}>
              <line
                x1={xFor(i * 24)}
                x2={xFor(i * 24)}
                y1={PAD_T}
                y2={H - PAD_B}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-[color:var(--color-border)]"
                opacity="0.4"
              />
              <text
                x={center}
                y={H - PAD_B + 16}
                fontSize="11"
                textAnchor="middle"
                className="fill-[color:var(--color-fg-muted)]"
              >
                {d}
              </text>
            </g>
          );
        })}

        {/* Trace */}
        <motion.path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[color:var(--color-fg)]"
          initial={{ pathLength: 0, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        {/* Peak marker */}
        <circle
          cx={peakX}
          cy={peakY}
          r="4"
          fill="var(--color-accent-strong)"
          stroke="var(--color-bg)"
          strokeWidth="1.5"
        />
        {/* Leader line up to annotation in top margin */}
        <line
          x1={peakX}
          y1={peakY - 6}
          x2={peakX}
          y2={PAD_T - 22}
          stroke="currentColor"
          strokeWidth="0.8"
          className="text-[color:var(--color-fg-subtle)]"
        />
        <text
          x={peakX}
          y={PAD_T - 24}
          fontSize="10"
          textAnchor="middle"
          className="fill-[color:var(--color-fg)] font-medium"
        >
          {annotation}
        </text>
        <text
          x={peakX}
          y={PAD_T - 12}
          fontSize="9"
          textAnchor="middle"
          className="fill-[color:var(--color-fg-subtle)]"
        >
          peak {SERIES[peakI].toFixed(1)}°F
        </text>
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-3 pb-1 text-xs text-[color:var(--ink-2)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-[2px] w-5 rounded-full"
            style={{
              background:
                "repeating-linear-gradient(to right, var(--punch) 0 4px, transparent 4px 8px)",
            }}
          />
          setpoint {setpoint}°F
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-[2px] w-5 rounded-full bg-[color:var(--ink)]"
          />
          zone temperature
        </span>
      </figcaption>
    </figure>
  );
}
