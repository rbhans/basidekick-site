"use client";

import { useId } from "react";
import { MEDIUM, type Medium, STROKE, MOTION, COLOR } from "./tokens";

interface PipeProps {
  /** Series of [x,y] points the pipe follows. Order = flow direction. */
  points: Array<[number, number]>;
  medium: Medium;
  /** When true, animated arrow chevrons travel along the pipe pointing
   * toward the LAST point in `points`. */
  flowing?: boolean;
  /** Optional label drawn near the midpoint. */
  label?: string;
  /** Optional dash pattern; useful for control wires ("4 3"). */
  dash?: string;
  /** Override stroke width — defaults to STROKE.pipe. */
  strokeWidth?: number;
}

/**
 * Draw a poly-line pipe with semantic color + optional animated flow arrows.
 * Arrows traverse the path via native SVG <animateMotion> for reliable
 * cross-browser animation.
 */
export function Pipe({
  points,
  medium,
  flowing = false,
  label,
  dash,
  strokeWidth = STROKE.pipe,
}: PipeProps) {
  // Stable id for <animateMotion mpath> references.
  const pathId = useId().replace(/[:#]/g, "");

  if (points.length < 2) return null;
  const m = MEDIUM[medium];
  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const totalLength = points.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const [px, py] = points[i - 1];
    return acc + Math.hypot(p[0] - px, p[1] - py);
  }, 0);
  const flowDurationSec = Math.max(
    1.2,
    totalLength / MOTION.flowDotPxPerSecond,
  );

  const mid = points[Math.floor(points.length / 2)];
  const arrowSize = Math.max(6, strokeWidth * 2.2);

  return (
    <g>
      {/* Hidden reference path for SMIL animateMotion */}
      <defs>
        <path id={`pipe-${pathId}`} d={d} />
      </defs>

      {/* Visible pipe */}
      <path
        d={d}
        fill="none"
        stroke={m.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
      />

      {/* Flow chevrons */}
      {flowing
        ? [0, 0.5].map((offset) => (
            <g key={offset}>
              <path
                d={`M ${-arrowSize * 0.6} ${-arrowSize * 0.7} L ${arrowSize * 0.7} 0 L ${-arrowSize * 0.6} ${arrowSize * 0.7} Z`}
                fill={m.stroke}
              >
                <animateMotion
                  dur={`${flowDurationSec}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  begin={`${offset * flowDurationSec}s`}
                >
                  <mpath href={`#pipe-${pathId}`} />
                </animateMotion>
              </path>
            </g>
          ))
        : null}

      {label ? (
        <text
          x={mid[0]}
          y={mid[1] - strokeWidth - 4}
          fontSize="10"
          textAnchor="middle"
          style={{
            fill: m.stroke,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

interface DuctProps {
  x: number;
  y: number;
  width: number;
  height: number;
  /** When true, airflow chevrons travel left-to-right inside the duct. */
  flowing?: boolean;
  /** Left side cap: "open" leaves it open; "closed" draws a vertical line. */
  leftCap?: "open" | "closed";
  rightCap?: "open" | "closed";
  /** Gaps in the TOP wall (e.g. where a return-air branch drops in).
   *  Each entry = [startX, endX] in the same viewBox coords as `x`. */
  topOpenings?: Array<[number, number]>;
  /** Gaps in the BOTTOM wall. */
  bottomOpenings?: Array<[number, number]>;
}

/**
 * Horizontal duct: parallel top + bottom lines with cream fill. End caps
 * default to "open" (no vertical end-line). `flowing` animates crimson
 * chevrons L→R via SMIL animateMotion.
 */
export function Duct({
  x,
  y,
  width,
  height,
  flowing = false,
  leftCap = "open",
  rightCap = "open",
  topOpenings = [],
  bottomOpenings = [],
}: DuctProps) {
  const pathId = useId().replace(/[:#]/g, "");
  const arrowY = y + height / 2;
  const arrowSize = 10;
  const duration = Math.max(2, width / 90);
  // Straight-line path for animateMotion.
  const ductPath = `M ${x - arrowSize} ${arrowY} L ${x + width + arrowSize} ${arrowY}`;

  // Compute wall segments with openings carved out.
  function wallSegments(openings: Array<[number, number]>): Array<[number, number]> {
    const ranges = openings
      .map(([a, b]) => [Math.max(x, a), Math.min(x + width, b)] as [number, number])
      .filter(([a, b]) => b > a)
      .sort((a, b) => a[0] - b[0]);
    if (ranges.length === 0) return [[x, x + width]];
    const segs: Array<[number, number]> = [];
    let cursor = x;
    for (const [a, b] of ranges) {
      if (a > cursor) segs.push([cursor, a]);
      cursor = Math.max(cursor, b);
    }
    if (cursor < x + width) segs.push([cursor, x + width]);
    return segs;
  }

  const topSegs = wallSegments(topOpenings);
  const bottomSegs = wallSegments(bottomOpenings);

  return (
    <g>
      <defs>
        <path id={`duct-${pathId}`} d={ductPath} />
      </defs>
      {/* Soft cream fill */}
      <rect x={x} y={y} width={width} height={height} fill={COLOR.cream} />
      {/* Top + bottom walls (segments around any openings) */}
      {topSegs.map(([a, b], i) => (
        <line
          key={`top-${i}`}
          x1={a}
          y1={y}
          x2={b}
          y2={y}
          stroke={COLOR.ink}
          strokeWidth={STROKE.duct}
        />
      ))}
      {bottomSegs.map(([a, b], i) => (
        <line
          key={`bot-${i}`}
          x1={a}
          y1={y + height}
          x2={b}
          y2={y + height}
          stroke={COLOR.ink}
          strokeWidth={STROKE.duct}
        />
      ))}
      {leftCap === "closed" ? (
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={y + height}
          stroke={COLOR.ink}
          strokeWidth={STROKE.bold}
        />
      ) : null}
      {rightCap === "closed" ? (
        <line
          x1={x + width}
          y1={y}
          x2={x + width}
          y2={y + height}
          stroke={COLOR.ink}
          strokeWidth={STROKE.bold}
        />
      ) : null}
      {flowing
        ? [0, 0.33, 0.66].map((offset) => (
            <g key={offset}>
              <path
                d={`M ${-arrowSize * 0.6} ${-arrowSize * 0.8} L ${arrowSize * 0.8} 0 L ${-arrowSize * 0.6} ${arrowSize * 0.8} Z`}
                fill={COLOR.punch}
              >
                <animateMotion
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  begin={`${offset * duration}s`}
                >
                  <mpath href={`#duct-${pathId}`} />
                </animateMotion>
              </path>
            </g>
          ))
        : null}
    </g>
  );
}
