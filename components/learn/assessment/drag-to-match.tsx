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

export interface MatchPair {
  /** Stable id for the left item. */
  id: string;
  left: string;
  right: string;
}

interface DragToMatchProps {
  prompt?: string;
  pairs: MatchPair[];
  componentId?: string;
}

interface DTMState {
  /** Map of left-id → right-id chosen for it. */
  assignments: Record<string, string>;
  submitted: boolean;
}

function shuffleStable<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const r = (Math.sin(seed + i) + 1) / 2;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function DragToMatch({ prompt, pairs, componentId }: DragToMatchProps) {
  const mounted = useHasMounted();
  const id = useComponentId(componentId, "match");
  const [state, setState] = useComponentProgress<DTMState>(id, {
    assignments: {},
    submitted: false,
  });
  const rightOptions = useMemo(
    () => shuffleStable(pairs, pairs.length * 7).map((p) => ({ id: p.id, text: p.right })),
    [pairs],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over) return;
    const leftId = String(e.over.id).replace(/^left-/, "");
    const rightId = String(e.active.id).replace(/^right-/, "");
    setState((prev) => {
      const next = { ...prev.assignments };
      // Remove this right from any prior left
      for (const key of Object.keys(next)) {
        if (next[key] === rightId) delete next[key];
      }
      next[leftId] = rightId;
      return { ...prev, assignments: next, submitted: false };
    });
  };

  const onSubmit = () => setState((s) => ({ ...s, submitted: true }));
  const onReset = () => setState({ assignments: {}, submitted: false });

  const allAssigned =
    Object.keys(state.assignments).length === pairs.length;

  const correctCount = pairs.filter(
    (p) => state.assignments[p.id] === p.id,
  ).length;
  const allCorrect = state.submitted && correctCount === pairs.length;

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Match pairs
      </p>
      {prompt ? (
        <p className="font-serif text-lg leading-snug tracking-tight text-[color:var(--color-fg)]">
          {prompt}
        </p>
      ) : null}

      {!mounted ? (
        <div className="mt-5 h-40 animate-pulse rounded-[var(--radius-card)] bg-[color:var(--color-bg)]" />
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_1fr]">
          <ul className="space-y-2">
            {pairs.map((pair) => (
              <MatchSlot
                key={pair.id}
                leftId={pair.id}
                label={pair.left}
                assignedRightId={state.assignments[pair.id]}
                rightText={
                  rightOptions.find((r) => r.id === state.assignments[pair.id])
                    ?.text
                }
                isCorrect={
                  state.submitted &&
                  state.assignments[pair.id] === pair.id
                }
                isWrong={
                  state.submitted &&
                  !!state.assignments[pair.id] &&
                  state.assignments[pair.id] !== pair.id
                }
              />
            ))}
          </ul>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
              Drag to a slot
            </p>
            <ul className="flex flex-wrap gap-2">
              {rightOptions.map((opt) => {
                const isPlaced = Object.values(state.assignments).includes(opt.id);
                if (isPlaced) return null;
                return <MatchChip key={opt.id} id={opt.id} text={opt.text} />;
              })}
            </ul>
          </div>
        </div>
      </DndContext>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allAssigned || (state.submitted && allCorrect)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-[color:var(--color-accent-fg)] transition hover:bg-[color:var(--color-accent-strong)] disabled:opacity-50"
        >
          Check matches
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
              {correctCount} / {pairs.length} matched
            </span>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="text-[color:var(--color-fg-subtle)] underline-offset-4 hover:text-[color:var(--color-fg)] hover:underline"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

function MatchSlot({
  leftId,
  label,
  assignedRightId,
  rightText,
  isCorrect,
  isWrong,
}: {
  leftId: string;
  label: string;
  assignedRightId: string | undefined;
  rightText: string | undefined;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `left-${leftId}` });
  const slotStyles = isCorrect
    ? "border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)]"
    : isWrong
      ? "border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)]"
      : isOver
        ? "border-[color:var(--color-accent-strong)] bg-[color:var(--color-accent-soft)]"
        : "border-[color:var(--color-border)] bg-[color:var(--color-bg)]";
  return (
    <li ref={setNodeRef}>
      <div
        className={`flex items-center gap-3 rounded-[var(--radius-control)] border px-3 py-3 transition ${slotStyles}`}
      >
        <span className="min-w-[7rem] font-medium text-[color:var(--color-fg)]">
          {label}
        </span>
        <span className="flex-1 text-sm text-[color:var(--color-fg-muted)]">
          {assignedRightId
            ? rightText
            : <span className="text-[color:var(--color-fg-subtle)] italic">Drop here</span>}
        </span>
      </div>
    </li>
  );
}

function MatchChip({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `right-${id}` });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
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
            ? "cursor-grabbing rounded-[var(--radius-control)] border border-[color:var(--color-accent-strong)] bg-[color:var(--color-bg)] px-3 py-2 text-sm text-[color:var(--color-fg)] shadow-lg"
            : "cursor-grab rounded-[var(--radius-control)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-3 py-2 text-sm text-[color:var(--color-fg)] transition hover:bg-[color:var(--color-bg-muted)]"
        }
      >
        {text}
      </button>
    </li>
  );
}
