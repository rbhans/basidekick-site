interface KbdHintProps {
  keys: string;
}

export function KbdHint({ keys }: KbdHintProps) {
  return (
    <kbd className="inline-flex items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground ml-1.5">
      {keys}
    </kbd>
  );
}
