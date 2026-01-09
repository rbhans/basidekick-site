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
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
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
