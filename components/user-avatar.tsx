"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Generate consistent color based on name
function getAvatarColor(name: string): string {
  // Brand-palette identity colors (see app/globals.css :root chart-*)
  const colors = [
    "bg-[var(--foreground)]",
    "bg-[var(--chart-2)]",
    "bg-[var(--chart-3)]",
    "bg-[var(--accent)]",
    "bg-[var(--chart-5)]",
    "bg-[var(--destructive)]",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string | null): string {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const sizeClasses = {
  sm: "size-6 text-xs",
  md: "size-8 text-sm",
  lg: "size-10 text-base",
};

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 40,
};

export function UserAvatar({ name, avatarUrl, size = "md", className }: UserAvatarProps) {
  const initials = getInitials(name);
  const colorClass = name ? getAvatarColor(name) : "bg-muted";

  // If avatar URL is provided, show the image
  if (avatarUrl) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden shrink-0 bg-muted",
          sizeClasses[size],
          className
        )}
        title={name || "Anonymous"}
      >
        <Image
          src={avatarUrl}
          alt={name || "User avatar"}
          width={imageSizes[size]}
          height={imageSizes[size]}
          sizes={`${imageSizes[size]}px`}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      </div>
    );
  }

  // Fall back to initials
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium text-white shrink-0",
        sizeClasses[size],
        colorClass,
        className
      )}
      title={name || "Anonymous"}
    >
      {initials}
    </div>
  );
}
