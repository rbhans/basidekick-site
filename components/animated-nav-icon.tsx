"use client";

import type { HTMLAttributes, RefAttributes } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { BookTextIcon } from "@/components/lucide-animated/book-text";
import { CompassIcon } from "@/components/lucide-animated/compass";
import { GaugeIcon } from "@/components/lucide-animated/gauge";
import { GraduationCapIcon } from "@/components/lucide-animated/graduation-cap";
import { RadioIcon } from "@/components/lucide-animated/radio";
import { UsersIcon } from "@/components/lucide-animated/users";
import { WrenchIcon } from "@/components/lucide-animated/wrench";

export type AnimatedNavIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type AnimatedIconComponent = React.ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> &
    { size?: number } &
    RefAttributes<AnimatedNavIconHandle>
>;

const ICONS: Record<string, AnimatedIconComponent> = {
  dashboard: GaugeIcon,
  atlas: CompassIcon,
  wiki: BookTextIcon,
  courses: GraduationCapIcon,
  news: RadioIcon,
  pointstack: UsersIcon,
  tools: WrenchIcon,
};

type AnimatedNavIconProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  size?: number;
};

export const AnimatedNavIcon = forwardRef<
  AnimatedNavIconHandle,
  AnimatedNavIconProps
>(({ name, size = 18, ...props }, forwardedRef) => {
  const iconRef = useRef<AnimatedNavIconHandle>(null);
  const Icon = ICONS[name] ?? GaugeIcon;

  useImperativeHandle(forwardedRef, () => ({
    startAnimation: () => iconRef.current?.startAnimation(),
    stopAnimation: () => iconRef.current?.stopAnimation(),
  }));

  return <Icon ref={iconRef} size={size} {...props} />;
});

AnimatedNavIcon.displayName = "AnimatedNavIcon";

export function useNavIconAnimation() {
  const iconRef = useRef<AnimatedNavIconHandle>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    iconRef.current?.stopAnimation();
  }, []);

  const start = useCallback(() => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    iconRef.current?.startAnimation();
  }, []);

  const playClick = useCallback(() => {
    start();
    stopTimerRef.current = setTimeout(stop, 520);
  }, [start, stop]);

  useEffect(() => () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
  }, []);

  return { iconRef, start, stop, playClick };
}
