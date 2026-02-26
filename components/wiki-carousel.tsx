"use client";

import { useState, useEffect } from "react";
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (articles.length === 0) return null;

  // Double the list for seamless looping
  const doubled = [...articles, ...articles];

  // Speed: ~8s per card for a slow, smooth scroll
  const duration = articles.length * 8;

  return (
    <div className="group/carousel relative overflow-hidden">
      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: prefersReducedMotion
            ? "none"
            : `marquee-scroll ${duration}s linear infinite`,
          animationPlayState: "running",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = "running";
        }}
      >
        {doubled.map((article, i) => (
          <div
            key={`${article.id}-${i}`}
            className="flex-shrink-0 w-[300px] sm:w-[340px]"
          >
            <ArticleCard
              slug={article.slug}
              category={article.category?.name}
              categorySlug={article.category?.slug}
              title={article.title}
              description={article.summary}
              accentColor={getWikiCategoryColor(article.category?.name, article.category?.slug)}
            />
          </div>
        ))}
      </div>

      {/* Fade edges — match the muted/40 section background */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-muted/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-muted/40 to-transparent" />
    </div>
  );
}
