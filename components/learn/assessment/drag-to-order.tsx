"use client";

import { useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useComponentId } from "@/components/learn/shared/use-component-id";
import { useComponentProgress } from "@/components/learn/shared/use-component-progress";
import { useHasMounted } from "@/components/learn/shared/use-has-mounted";

interface DragToOrderProps {
  prompt: string;
  /** Items in their CORRECT order. Component shuffles for display. */
  items: string[];
  componentId?: string;
}

interface DTOState {
  order: string[];
  submitted: boolean;
}

function shuffleStable<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const r = (Math.sin(seed + i * 1.3) + 1) / 2;
    const j = Math.floor(r * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function DragToOrder({ prompt, items, componentId }: DragToOrderProps) {
  const mounted = useHasMounted();
  const id = useComponentId(componentId, "order");
  const shuffled = useMemo(
    () => shuffleStable(items, items.length * 11),
    [items],
  );
  const [state, setState] = useComponentProgress<DTOState>(id, {
    order: shuffled,
    submitted: false,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setState((prev) => {
      const oldIndex = prev.order.indexOf(String(active.id));
      const newIndex = prev.order.indexOf(String(over.id));
      return {
        ...prev,
        order: arrayMove(prev.order, oldIndex, newIndex),
        submitted: false,
      };
    });
  };

  const reset = () => setState({ order: shuffled, submitted: false });
  const onSubmit = () => setState((s) => ({ ...s, submitted: true }));

  const correctness = state.order.map((item, idx) => item === items[idx]);
  const allCorrect = state.submitted && correctness.every(Boolean);
  const correctCount = correctness.filter(Boolean).length;

  return (
    <section className="my-10 rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] p-6">
      <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
        Put these in order
      </p>
      <p className="font-serif text-lg leading-snug tracking-tight text-[color:var(--color-fg)]">
        {prompt}
      </p>

      {!mounted ? (
        <ol className="mt-5 space-y-2">
          {state.order.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-[color:var(--color-fg)]"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-bg-muted)] text-xs" />
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ol>
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={state.order}
          strategy={verticalListSortingStrategy}
        >
          <ol className="mt-5 space-y-2">
            {state.order.map((item, idx) => (
              <SortableRow
                key={item}
                id={item}
                index={idx}
                submitted={state.submitted}
                correct={correctness[idx]}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={state.submitted && allCorrect}
          className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-[color:var(--color-accent-fg)] transition hover:bg-[color:var(--color-accent-strong)] disabled:opacity-50"
        >
          Check order
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
              {correctCount} / {items.length} in place
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

function SortableRow({
  id,
  index,
  submitted,
  correct,
}: {
  id: string;
  index: number;
  submitted: boolean;
  correct: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const stateStyles = submitted
    ? correct
      ? "border-[color:var(--color-feedback-correct-border)] bg-[color:var(--color-feedback-correct-bg)] text-[color:var(--color-feedback-correct-fg)]"
      : "border-[color:var(--color-feedback-incorrect-border)] bg-[color:var(--color-feedback-incorrect-bg)] text-[color:var(--color-feedback-incorrect-fg)]"
    : isDragging
      ? "border-[color:var(--color-accent-strong)] bg-[color:var(--color-bg)] shadow-lg"
      : "border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)]";
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex cursor-grab items-center gap-3 rounded-[var(--radius-control)] border px-4 py-3 transition ${stateStyles}`}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-bg-muted)] text-xs font-medium tabular-nums text-[color:var(--color-fg-muted)]"
      >
        {index + 1}
      </span>
      <span className="flex-1 text-[color:var(--color-fg)]">{id}</span>
      <span
        aria-hidden="true"
        className="text-[color:var(--color-fg-subtle)]"
      >
        ⋮⋮
      </span>
    </li>
  );
}
