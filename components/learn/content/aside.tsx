import type { ReactNode } from "react";

interface AsideProps {
  attribution?: string;
  children: ReactNode;
}

export function Aside({ attribution, children }: AsideProps) {
  return (
    <figure className="my-12 border-y border-[color:var(--color-border)] py-8">
      <blockquote className="font-serif text-2xl italic leading-[1.4] tracking-tight text-[color:var(--color-fg)]">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-4 text-sm uppercase tracking-[0.16em] text-[color:var(--color-fg-subtle)]">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
