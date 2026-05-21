"use client";

import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { LabeledSchematic, COLOR } from "@/components/learn/shapes";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";
import { useHasMounted } from "@/components/learn/shared/use-has-mounted";
import {
  AHU_W,
  AHU_H,
  AHU_CENTERS,
  AhuStaticBody,
} from "./ahu-static-body";

/**
 * Drag-to-match labels onto the shape-kit AHU. Drop targets sit offset from
 * each component (above the RA enclosure, below the main duct) so the
 * diagram stays legible. Percent coords map 1:1 to the SVG viewBox via the
 * LabeledSchematic overlay slot.
 */

interface DropTarget {
  id: string;
  /** Drop-zone position in viewBox space — converted to percent below. */
  cx: number;
  cy: number;
  label: string;
}

const TARGETS: DropTarget[] = [
  { id: "oa-damper", cx: AHU_CENTERS.oaDamper.cx, cy: 320, label: "OA damper" },
  { id: "ra-damper", cx: AHU_CENTERS.raDamper.cx, cy: 50, label: "RA damper" },
  { id: "filter", cx: AHU_CENTERS.filter.cx, cy: 320, label: "Filter" },
  { id: "cooling-coil", cx: AHU_CENTERS.coolingCoil.cx, cy: 320, label: "Cooling coil" },
  { id: "heating-coil", cx: AHU_CENTERS.heatingCoil.cx, cy: 320, label: "Heating coil" },
  { id: "supply-fan", cx: AHU_CENTERS.supplyFan.cx, cy: 320, label: "Supply fan" },
];

interface State {
  /** Drop-target id → label-id placed in it. */
  placements: Record<string, string>;
  submitted: boolean;
}

function shuffleStable<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const r = (Math.sin(seed + i * 2.7) + 1) / 2;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface AhuLabelMatchProps {
  prompt?: string;
  componentId?: string;
}

export function AhuLabelMatch({
  prompt = "Drag each label onto the component it names.",
  componentId,
}: AhuLabelMatchProps) {
  const mounted = useHasMounted();
  const id = useComponentId(componentId, "ahu-label-match");
  const [state, setState] = useComponentProgress<State>(id, {
    placements: {},
    submitted: false,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const trayItems = useMemo(
    () => shuffleStable(TARGETS, TARGETS.length * 13),
    [],
  );
  const placedLabelIds = new Set(Object.values(state.placements));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over) return;
    const overId = String(e.over.id);
    const labelId = String(e.active.id).replace(/^label-/, "");
    if (overId === "target-tray") {
      setState((prev) => {
        const next = { ...prev.placements };
        for (const key of Object.keys(next)) {
          if (next[key] === labelId) delete next[key];
        }
        return { ...prev, placements: next, submitted: false };
      });
      return;
    }
    const targetId = overId.replace(/^target-/, "");
    setState((prev) => {
      const next = { ...prev.placements };
      for (const key of Object.keys(next)) {
        if (next[key] === labelId) delete next[key];
      }
      next[targetId] = labelId;
      return { ...prev, placements: next, submitted: false };
    });
  };

  const onSubmit = () => setState((s) => ({ ...s, submitted: true }));
  const reset = () => setState({ placements: {}, submitted: false });

  const allPlaced = Object.keys(state.placements).length === TARGETS.length;
  const correctCount = TARGETS.filter(
    (t) => state.placements[t.id] === t.id,
  ).length;
  const allCorrect = state.submitted && correctCount === TARGETS.length;

  const overlay = (
    <>
      {TARGETS.map((target) => (
        <LabelDropTarget
          key={target.id}
          target={target}
          xPct={(target.cx / AHU_W) * 100}
          yPct={(target.cy / AHU_H) * 100}
          placedLabelId={state.placements[target.id]}
          placedLabel={
            TARGETS.find((t) => t.id === state.placements[target.id])?.label
          }
          isCorrect={
            state.submitted && state.placements[target.id] === target.id
          }
          isWrong={
            state.submitted &&
            !!state.placements[target.id] &&
            state.placements[target.id] !== target.id
          }
        />
      ))}
    </>
  );

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Label the diagram
      </p>
      {prompt ? (
        <p className="text-lg leading-snug tracking-tight text-[color:var(--color-fg)]">
          {prompt}
        </p>
      ) : null}

      {!mounted ? (
        <LabeledSchematic
          width={AHU_W}
          height={AHU_H}
          kicker="AHU · LABEL IT"
          legend={[
            { color: COLOR.chwsBlue, label: "CHW" },
            { color: COLOR.hwsRed, label: "HW" },
          ]}
        >
          <AhuStaticBody />
        </LabeledSchematic>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <LabeledSchematic
            width={AHU_W}
            height={AHU_H}
            kicker="AHU · LABEL IT"
            legend={[
              { color: COLOR.chwsBlue, label: "CHW" },
              { color: COLOR.hwsRed, label: "HW" },
            ]}
            overlay={overlay}
          >
            <AhuStaticBody />
          </LabeledSchematic>

          <TrayDroppable>
            <ul className="flex flex-wrap gap-2">
              {trayItems.map((item) =>
                placedLabelIds.has(item.id) ? null : (
                  <LabelChip key={item.id} id={item.id} text={item.label} />
                ),
              )}
              {trayItems.every((item) => placedLabelIds.has(item.id)) ? (
                <span className="text-sm italic text-[color:var(--color-fg-subtle)]">
                  All labels placed
                </span>
              ) : null}
            </ul>
          </TrayDroppable>
        </DndContext>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allPlaced || (state.submitted && allCorrect)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-[color:var(--color-accent-fg)] transition hover:bg-[color:var(--color-accent-strong)] disabled:opacity-50"
        >
          Check labels
        </button>
        <div className="flex items-center gap-4 text-sm">
          {state.submitted ? (
            <span
              className={
                allCorrect
                  ? "font-medium text-[color:var(--color-feedback-correct-fg)]"
                  : "font-medium text-[color:var(--color-feedback-partial-fg)]"
              }
            >
              {correctCount} / {TARGETS.length} placed correctly
            </span>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="text-[color:var(--color-fg-subtle)] underline-offset-4 hover:text-[color:var(--color-fg)] hover:underline"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

function LabelDropTarget({
  target,
  xPct,
  yPct,
  placedLabelId,
  placedLabel,
  isCorrect,
  isWrong,
}: {
  target: DropTarget;
  xPct: number;
  yPct: number;
  placedLabelId: string | undefined;
  placedLabel: string | undefined;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `target-${target.id}` });
  const ringStyles = isCorrect
    ? "border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] text-[color:var(--color-feedback-correct-fg)]"
    : isWrong
      ? "border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)] text-[color:var(--color-feedback-incorrect-fg)]"
      : isOver
        ? "border-[color:var(--punch)] bg-[color:var(--punch-soft)] text-[color:var(--punch)]"
        : "border-dashed border-[color:var(--border-strong)] bg-[color:var(--sand)]/90 text-[color:var(--ink-2)]";
  return (
    <div
      ref={setNodeRef}
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className={`min-w-[5rem] max-w-[8rem] rounded-full border-2 px-2 py-1 text-center text-[11px] font-medium leading-tight whitespace-nowrap shadow-sm ${ringStyles}`}
      >
        {placedLabelId ? placedLabel : "—"}
      </div>
    </div>
  );
}

function TrayDroppable({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "target-tray" });
  return (
    <div
      ref={setNodeRef}
      className={
        isOver
          ? "mt-4 rounded-[var(--radius-card)] border border-dashed border-[color:var(--punch)] bg-[color:var(--punch-soft)] p-3"
          : "mt-4 rounded-[var(--radius-card)] border border-dashed border-[color:var(--border)] bg-[color:var(--sand)] p-3"
      }
    >
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-3)]">
        Labels
      </p>
      {children}
    </div>
  );
}

function LabelChip({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `label-${id}` });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <li>
      <button
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        type="button"
        className={
          isDragging
            ? "cursor-grabbing rounded-full border border-[color:var(--punch)] bg-[color:var(--sand)] px-3 py-1 text-xs text-[color:var(--ink)] shadow-lg"
            : "cursor-grab rounded-full border border-[color:var(--border-strong)] bg-[color:var(--sand)] px-3 py-1 text-xs text-[color:var(--ink)] transition hover:bg-[color:var(--cream)]"
        }
      >
        {text}
      </button>
    </li>
  );
}
