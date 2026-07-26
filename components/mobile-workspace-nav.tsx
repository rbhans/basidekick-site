"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/primitives/sheet";
import { WorkspaceSidebarContent } from "@/components/workspace-sidebar-content";

export function MobileWorkspaceNav({
  open,
  onOpenChange,
  pathname,
  currentId,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  currentId?: string;
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) onOpenChange(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="mobile-workspace-navigation"
        className="sidebar mobile-workspace-sheet"
        overlayClassName="mobile-scrim"
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <SheetTitle className="visually-hidden">
          BASidekick workspace navigation
        </SheetTitle>
        <SheetDescription className="visually-hidden">
          Navigate BASidekick sections and account controls.
        </SheetDescription>
        <WorkspaceSidebarContent
          pathname={pathname}
          currentId={currentId}
          collapsed={false}
          mobile
          onNavigate={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
