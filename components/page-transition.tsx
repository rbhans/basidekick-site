"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  viewId: string;
  viewTitle: string;
}

// Map view IDs to loading text
const viewLoadingText: Record<string, string> = {
  home: "HOME",
  tools: "TOOLS",
  nsk: "NIAGARA_SIDEKICK",
  ssk: "SIMULATOR_SIDEKICK",
  msk: "METASYS_SIDEKICK",
  resources: "RESOURCES",
  wiki: "WIKI",
  forum: "FORUM",
  psk: "PSK",
  account: "ACCOUNT",
  signin: "AUTH",
  signup: "AUTH",
};

export function PageTransition({ children, viewId, viewTitle }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const prevViewIdRef = useRef(viewId);
  const isFirstRender = useRef(true);

  const loadingText = viewLoadingText[viewId] || viewTitle.toUpperCase();
  const fullText = `> LOADING ${loadingText}...`;

  useEffect(() => {
    // Skip transition on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only trigger on view change
    if (viewId !== prevViewIdRef.current) {
      prevViewIdRef.current = viewId;
      setIsLoading(true);
      setDisplayText("");

      // Type out the loading text
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          // Small delay after typing completes, then show content
          setTimeout(() => {
            setIsLoading(false);
          }, 150);
        }
      }, 25);

      return () => clearInterval(typeInterval);
    }
  }, [viewId, fullText]);

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-background">
        <div className="font-mono text-sm text-primary">
          {displayText}
          <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
