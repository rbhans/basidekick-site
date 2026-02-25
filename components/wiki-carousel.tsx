"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { ArticleCard } from "./article-card";
import { getWikiCategoryColor } from "@/lib/wiki-colors";

interface CarouselArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  created_at: string;
  category: { name: string; slug: string } | null;
}

interface WikiCarouselProps {
  articles: CarouselArticle[];
}

export function WikiCarousel({ articles }: WikiCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // How many cards to show at once based on viewport
  const getVisibleCount = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getVisibleCount]);

  const maxIndex = Math.max(0, articles.length - visibleCount);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-advance
  useEffect(() => {
    if (isPaused || articles.length <= visibleCount) return;

    intervalRef.current = setInterval(goNext, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, goNext, articles.length, visibleCount]);

  // Respect reduced motion
  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (articles.length === 0) return null;

  const dotCount = Math.min(maxIndex + 1, 10); // Cap dot indicators
  const dotStep = maxIndex > 9 ? Math.floor(maxIndex / 9) : 1;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Track */}
      <div className="overflow-hidden" ref={containerRef}>
        <div
          className={`flex gap-4 ${prefersReducedMotion ? "" : "transition-transform duration-500 ease-in-out"}`}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleCount + (4 * (visibleCount - 1)) / visibleCount)}%)`,
            width: `${(articles.length / visibleCount) * 100}%`,
          }}
        >
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex-shrink-0"
              style={{ width: `${100 / articles.length}%` }}
            >
              <ArticleCard
                slug={article.slug}
                category={article.category?.name}
                title={article.title}
                description={article.summary}
                accentColor={getWikiCategoryColor(article.category?.name)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {articles.length > visibleCount && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors z-10"
            aria-label="Previous articles"
          >
            <CaretLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors z-10"
            aria-label="Next articles"
          >
            <CaretRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {articles.length > visibleCount && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(dotCount, maxIndex + 1) }).map((_, i) => {
            const dotIndex = i * dotStep;
            const isActive = Math.abs(currentIndex - dotIndex) < dotStep;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(Math.min(dotIndex, maxIndex))}
                className={`rounded-full transition-all ${
                  isActive
                    ? "w-3 h-3 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
