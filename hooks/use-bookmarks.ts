"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "basidekick_bookmarks";

export interface Bookmark {
  id: string;
  type: "wiki" | "forum";
  title: string;
  slug: string;
  category?: string;
  addedAt: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
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

  const removeBookmark = useCallback((id: string, type: "wiki" | "forum") => {
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
    (id: string, type: "wiki" | "forum") => {
      return bookmarks.some((b) => b.id === id && b.type === type);
    },
    [bookmarks]
  );

  const getBookmarksByType = useCallback(
    (type: "wiki" | "forum") => {
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
