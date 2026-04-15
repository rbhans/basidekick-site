"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "@phosphor-icons/react";
import { ReportDialog, type ReportTargetType } from "./report-dialog";
import type { ComponentProps } from "react";

type ButtonVariant = ComponentProps<typeof Button>["variant"];
type ButtonSize = ComponentProps<typeof Button>["size"];

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
  targetUrl?: string | null;
  isAuthenticated: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function ReportButton({
  targetType,
  targetId,
  targetLabel,
  targetUrl,
  isAuthenticated,
  variant = "outline",
  size = "sm",
  className,
  label,
  showIcon = true,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  const defaultLabel =
    targetType === "new_atlas_entry" ? "Suggest new entry" : "Report / suggest";

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {showIcon && <Flag className="mr-2 size-4" />}
        {label || defaultLabel}
      </Button>
      <ReportDialog
        open={open}
        onOpenChange={setOpen}
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
        targetUrl={targetUrl}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}
