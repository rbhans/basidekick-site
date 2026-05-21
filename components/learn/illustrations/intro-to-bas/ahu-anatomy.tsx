"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LabeledSchematic, COLOR } from "@/components/learn/shapes";
import {
  AHU_W,
  AHU_H,
  AHU_CENTERS,
  AHU_OA_CX,
  AHU_RA_CX,
  AHU_FLT_X,
  AHU_CC_X,
  AHU_HC_X,
  AHU_FAN_CX,
  AHU_COMP_W,
  AhuStaticBody,
} from "./ahu-static-body";

/**
 * Same AHU as the startup sequence, paused and stripped to a single static
 * frame. Numbered hotspots align EXACTLY to the underlying shape-kit
 * component centers (no SVG-vs-container percentage drift).
 */

export interface AhuHotspot {
  cx: number;
  cy: number;
  label: string;
  detail: ReactNode;
}

export const DEFAULT_AHU_HOTSPOTS: AhuHotspot[] = [
  {
    ...AHU_CENTERS.oaDamper,
    label: "Outside-air damper",
    detail:
      "Brings in fresh air. Modulates based on minimum ventilation, economizer logic, and demand-control ventilation.",
  },
  {
    ...AHU_CENTERS.raDamper,
    label: "Return-air damper",
    detail:
      "Recirculates conditioned air to save energy. Inverse-linked to the OA damper in most sequences.",
  },
  {
    ...AHU_CENTERS.filter,
    label: "Filter bank",
    detail:
      "Removes particulates. A pressure switch across the filter alarms when it's loaded enough to need replacement.",
  },
  {
    ...AHU_CENTERS.coolingCoil,
    label: "Cooling coil",
    detail:
      "Chilled water passes through; air gives up heat as it crosses. The BAS modulates the cooling valve to hit a discharge-air setpoint.",
  },
  {
    ...AHU_CENTERS.heatingCoil,
    label: "Heating coil",
    detail:
      "Hot water or steam. Heats the supply air in winter, or trims morning warm-up.",
  },
  {
    ...AHU_CENTERS.supplyFan,
    label: "Supply fan",
    detail:
      "Pushes conditioned air into the duct system. VFD-driven; static pressure is the controlled variable.",
  },
];

interface AhuAnatomyProps {
  /** Override the default 6 component hotspots. */
  hotspots?: AhuHotspot[];
  /** Title strip kicker. Default "AHU ANATOMY". */
  kicker?: string;
  /** Right-aligned tag. Default "PAUSED". */
  tag?: string;
  /** Italic caption under the legend. */
  caption?: ReactNode;
  /** Show the static label strip under the SVG. Default true. */
  showLabels?: boolean;
}

export function AhuAnatomy({
  hotspots,
  kicker = "AHU ANATOMY",
  tag = "PAUSED",
  caption = "Tap a number to inspect the component.",
  showLabels = true,
}: AhuAnatomyProps = {}) {
  const HOTSPOTS = hotspots ?? DEFAULT_AHU_HOTSPOTS;
  const [active, setActive] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Click-away + escape
  useEffect(() => {
    if (active === null) return;
    const onAway = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setActive(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("mousedown", onAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [active]);

  return (
    <div ref={wrapperRef} className="relative">
      <LabeledSchematic
        width={AHU_W}
        height={AHU_H}
        kicker={kicker}
        tag={tag}
        labels={
          showLabels
            ? [
                { x: AHU_OA_CX, text: "OA DAMPER" },
                { x: AHU_RA_CX, text: "RA DAMPER" },
                { x: AHU_FLT_X + AHU_COMP_W / 2, text: "FILTER" },
                { x: AHU_CC_X + AHU_COMP_W / 2, text: "COOLING" },
                { x: AHU_HC_X + AHU_COMP_W / 2, text: "HEATING" },
                { x: AHU_FAN_CX, text: "SUPPLY FAN" },
              ]
            : []
        }
        legend={[
          { color: COLOR.chwsBlue, label: "CHW" },
          { color: COLOR.hwsRed, label: "HW" },
          { color: COLOR.ink, label: "CONTROL", dashed: true },
        ]}
        caption={caption}
        overlay={HOTSPOTS.map((spot, idx) => (
          <HotspotPin
            key={idx}
            idx={idx}
            spot={spot}
            leftPct={(spot.cx / AHU_W) * 100}
            topPct={(spot.cy / AHU_H) * 100}
            active={active === idx}
            onToggle={() => setActive((cur) => (cur === idx ? null : idx))}
            onEnter={() => setActive(idx)}
          />
        ))}
      >
        <AhuStaticBody />
      </LabeledSchematic>
    </div>
  );
}

function HotspotPin({
  idx,
  spot,
  leftPct,
  topPct,
  active,
  onToggle,
  onEnter,
}: {
  idx: number;
  spot: AhuHotspot;
  leftPct: number;
  topPct: number;
  active: boolean;
  onToggle: () => void;
  onEnter: () => void;
}) {
  const anchorLeft = spot.cx / AHU_W < 0.22;
  const anchorRight = spot.cx / AHU_W > 0.78;
  const tooltipLeft = anchorLeft ? "0%" : anchorRight ? "100%" : "50%";
  const tooltipTransform = anchorLeft
    ? "translateX(0)"
    : anchorRight
      ? "translateX(-100%)"
      : "translateX(-50%)";
  const flipUp = spot.cy / AHU_H > 0.6;
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      aria-label={spot.label}
      aria-expanded={active}
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
    >
      <span
        className={
          active
            ? "relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[color:var(--punch)] bg-[color:var(--punch)] text-xs font-semibold text-[color:var(--cream)] shadow-md"
            : "relative inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[color:var(--border-strong)] bg-[color:var(--sand)] text-xs font-semibold text-[color:var(--ink)] shadow-sm transition hover:border-[color:var(--punch)] hover:text-[color:var(--punch)]"
        }
      >
        {idx + 1}
      </span>
      <AnimatePresence>
        {active ? (
          <span
            role="tooltip"
            style={{ left: tooltipLeft, transform: tooltipTransform }}
            className={
              flipUp
                ? "absolute bottom-[calc(100%+0.5rem)] z-20 w-64 max-w-[min(85vw,16rem)]"
                : "absolute top-[calc(100%+0.5rem)] z-20 w-64 max-w-[min(85vw,16rem)]"
            }
          >
            <motion.span
              initial={{ opacity: 0, y: flipUp ? 4 : -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: flipUp ? 4 : -4 }}
              transition={{ duration: 0.15 }}
              className="block rounded-[var(--radius-card)] border border-[color:var(--border-strong)] bg-[color:var(--sand)] p-3 text-left text-sm shadow-lg"
            >
              <span className="block font-semibold tracking-tight text-[color:var(--ink)]">
                {spot.label}
              </span>
              <span className="mt-1 block text-sm leading-snug text-[color:var(--ink-2)]">
                {spot.detail}
              </span>
            </motion.span>
          </span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}
