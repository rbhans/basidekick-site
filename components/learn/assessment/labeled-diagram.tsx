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
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";
import { useHasMounted } from "@/components/learn/shared/use-has-mounted";

export interface LabelTarget {
  /** Stable id (correct label). */
  id: string;
  /** Percentage 0-100. */
  x: number;
  y: number;
  label: string;
}

interface LabeledDiagramProps {
  src: string;
  alt: string;
  prompt?: string;
  targets: LabelTarget[];
  aspectRatio?: string;
  componentId?: string;
}

interface LDState {
  /** Target-id → label-id placed in it. */
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

export function LabeledDiagram({
  src,
  alt,
  prompt,
  targets,
  aspectRatio = "16 / 9",
  componentId,
}: LabeledDiagramProps) {
  const mounted = useHasMounted();
  const id = useComponentId(componentId, "labeled");
  const [state, setState] = useComponentProgress<LDState>(id, {
    placements: {},
    submitted: false,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const trayItems = useMemo(
    () => shuffleStable(targets, targets.length * 13),
    [targets],
  );
  const placedLabelIds = new Set(Object.values(state.placements));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over) return;
    const targetId = String(e.over.id).replace(/^target-/, "");
    const labelId = String(e.active.id).replace(/^label-/, "");
    if (targetId === "tray") {
      setState((prev) => {
        const next = { ...prev.placements };
        for (const key of Object.keys(next)) {
          if (next[key] === labelId) delete next[key];
        }
        return { ...prev, placements: next, submitted: false };
      });
      return;
    }
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

  const allPlaced = Object.keys(state.placements).length === targets.length;
  const correctCount = targets.filter(
    (t) => state.placements[t.id] === t.id,
  ).length;
  const allCorrect = state.submitted && correctCount === targets.length;

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Label the diagram
      </p>
      {prompt ? (
        <p className="font-serif text-lg leading-snug tracking-tight text-[color:var(--color-fg)]">
          {prompt}
        </p>
      ) : null}

      {!mounted ? (
        <div
          className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
          style={{ aspectRatio }}
        >
          <img
            src={src}
            alt={alt}
            className="block h-full w-full object-contain opacity-60"
          />
        </div>
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div
          className="relative mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
          style={{ aspectRatio }}
        >
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain"
          />
          {targets.map((target) => (
            <LabelDropTarget
              key={target.id}
              target={target}
              placedLabelId={state.placements[target.id]}
              placedLabel={
                trayItems.find((t) => t.id === state.placements[target.id])?.label
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
        </div>

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
              {correctCount} / {targets.length} placed correctly
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
  placedLabelId,
  placedLabel,
  isCorrect,
  isWrong,
}: {
  target: LabelTarget;
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
        : "border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-muted)]/80 text-[color:var(--color-fg-muted)]";
  return (
    <div
      ref={setNodeRef}
      style={{ left: `${target.x}%`, top: `${target.y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className={`min-w-[3rem] max-w-[7rem] rounded-full border-2 px-2 py-0.5 text-center text-[10px] font-medium leading-tight whitespace-nowrap ${ringStyles}`}
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
          ? "mt-4 rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-accent-strong)] bg-[color:var(--color-accent-soft)] p-3"
          : "mt-4 rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3"
      }
    >
      <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
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
            ? "cursor-grabbing rounded-full border border-[color:var(--color-accent-strong)] bg-[color:var(--color-bg)] px-3 py-1 text-xs text-[color:var(--color-fg)] shadow-lg"
            : "cursor-grab rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-1 text-xs text-[color:var(--color-fg)] transition hover:bg-[color:var(--color-bg-muted)]"
        }
      >
        {text}
      </button>
    </li>
  );
}
