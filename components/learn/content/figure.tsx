"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FigureProps {
  src: string;
  alt: string;
  caption?: ReactNode;
  zoom?: boolean;
  width?: number;
  height?: number;
}

export function Figure({
  src,
  alt,
  caption,
  zoom = false,
  width,
  height,
}: FigureProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <figure className="my-10">
      {zoom ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Expand: ${alt}`}
          className="block w-full overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
        >
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="block h-auto w-full cursor-zoom-in"
          />
        </button>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]">
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="block h-auto w-full"
          />
        </div>
      )}
      {caption ? (
        <figcaption className="mt-3 text-sm text-[color:var(--color-fg-muted)]">
          {caption}
        </figcaption>
      ) : null}

      {zoom ? (
        <dialog
          ref={dialogRef}
          onClose={() => setOpen(false)}
          onClick={(e) => {
            if (e.target === dialogRef.current) setOpen(false);
          }}
          className="bg-transparent p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] max-w-[92vw] overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close image"
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-bg)] text-[color:var(--color-fg)] shadow"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
            <img
              src={src}
              alt={alt}
              className="block max-h-[86vh] max-w-[88vw] object-contain"
            />
          </div>
        </dialog>
      ) : null}
    </figure>
  );
}
