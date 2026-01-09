"use client";

import { Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useBookmarks, type Bookmark } from "@/hooks/use-bookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  item: Omit<Bookmark, "addedAt">;
  variant?: "default" | "icon";
  size?: "sm" | "default";
  className?: string;
}

export function BookmarkButton({
  item,
  variant = "default",
  size = "default",
  className,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, isLoaded } = useBookmarks();
  const bookmarked = isBookmarked(item.id, item.type);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(item);
  };

  if (!isLoaded) {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "default"}
        disabled
        className={cn(
          variant === "icon" && "size-8 p-0",
          className
        )}
      >
        <Star className={cn("size-4", variant === "default" && "mr-2")} />
        {variant === "default" && "Save"}
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "p-2 rounded-md transition-colors",
          bookmarked
            ? "text-yellow-500 hover:text-yellow-600"
            : "text-muted-foreground hover:text-foreground",
          className
        )}
        title={bookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <Star
          className="size-5"
          weight={bookmarked ? "fill" : "regular"}
        />
      </button>
    );
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size={size === "sm" ? "sm" : "default"}
      onClick={handleClick}
      className={cn(
        bookmarked && "bg-yellow-500 hover:bg-yellow-600 text-yellow-950",
        className
      )}
    >
      <Star
        className={cn("size-4 mr-2")}
        weight={bookmarked ? "fill" : "regular"}
      />
      {bookmarked ? "Saved" : "Save"}
    </Button>
  );
}
