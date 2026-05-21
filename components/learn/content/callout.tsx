import type { ComponentType, ReactNode } from "react";
import {
  InfoIcon,
  WarningIcon,
  LightbulbIcon,
  ChatCircleTextIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps } from "@phosphor-icons/react";

export type CalloutVariant = "info" | "warning" | "tip" | "industry-insight";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const VARIANT_LABELS: Record<CalloutVariant, string> = {
  info: "Note",
  warning: "Heads up",
  tip: "Tip",
  "industry-insight": "Industry insight",
};

const VARIANT_STYLES: Record<
  CalloutVariant,
  { border: string; bg: string; Icon: ComponentType<IconProps> }
> = {
  info: {
    border: "border-l-[color:var(--border-strong)]",
    bg: "bg-[color:var(--cream)]",
    Icon: InfoIcon,
  },
  warning: {
    border: "border-l-[color:var(--punch)]",
    bg: "bg-[color:var(--punch-soft)]",
    Icon: WarningIcon,
  },
  tip: {
    border: "border-l-[color:var(--punch)]",
    bg: "bg-[color:var(--cream)]",
    Icon: LightbulbIcon,
  },
  "industry-insight": {
    border: "border-l-[color:var(--ink)]",
    bg: "bg-[color:var(--cream)]",
    Icon: ChatCircleTextIcon,
  },
};

export function Callout({
  variant = "info",
  title,
  children,
}: CalloutProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.Icon;
  const heading = title ?? VARIANT_LABELS[variant];

  return (
    <aside
      className={`my-8 rounded-[var(--radius-card)] border border-[color:var(--border)] ${styles.bg} border-l-2 ${styles.border} p-5`}
    >
      <div className="brand-mono-label mb-2 flex items-center gap-2">
        <Icon
          weight="bold"
          size={16}
          aria-hidden="true"
          className={
            variant === "warning" || variant === "tip"
              ? "text-[color:var(--punch)]"
              : "text-[color:var(--ink-2)]"
          }
        />
        <span>{heading}</span>
      </div>
      <div className="text-[color:var(--ink)] [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
