"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "basidekick_bookmarks";

export type BookmarkType = "wiki" | "babel" | "calculator" | "reference";

export interface Bookmark {
  id: string;
  type: BookmarkType;
  title: string;
  slug: string;
  category?: string;
  babelType?: "point" | "equipment";
  section?: string;
  addedAt: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      return [];
    }
  });
  const [isLoaded, setIsLoaded] = useState(
    () => typeof window !== "undefined"
  );

  // Mark loaded on mount for SSR
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks:", error);
      }
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "addedAt">) => {
    setBookmarks((prev) => {
      // Check if already bookmarked
      if (prev.some((b) => b.id === bookmark.id && b.type === bookmark.type)) {
        return prev;
      }
      return [
        {
          ...bookmark,
          addedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }, []);

  const removeBookmark = useCallback((id: string, type: BookmarkType) => {
    setBookmarks((prev) => prev.filter((b) => !(b.id === id && b.type === type)));
  }, []);

  const toggleBookmark = useCallback(
    (bookmark: Omit<Bookmark, "addedAt">) => {
      const exists = bookmarks.some(
        (b) => b.id === bookmark.id && b.type === bookmark.type
      );
      if (exists) {
        removeBookmark(bookmark.id, bookmark.type);
      } else {
        addBookmark(bookmark);
      }
    },
    [bookmarks, addBookmark, removeBookmark]
  );

  const isBookmarked = useCallback(
    (id: string, type: BookmarkType) => {
      return bookmarks.some((b) => b.id === id && b.type === type);
    },
    [bookmarks]
  );

  const getBookmarksByType = useCallback(
    (type: BookmarkType) => {
      return bookmarks.filter((b) => b.type === type);
    },
    [bookmarks]
  );

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmarksByType,
  };
}
