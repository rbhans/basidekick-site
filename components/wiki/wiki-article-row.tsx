"use client";

import { WikiArticle, WikiTag } from "@/lib/types";
import { BookOpen, Calendar, Eye } from "@phosphor-icons/react";

interface WikiArticleRowProps {
  article: WikiArticle;
  tags?: WikiTag[];
  onClick: () => void;
}

export function WikiArticleRow({ article, tags, onClick }: WikiArticleRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-border bg-card p-4 hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
            {article.title}
          </h3>
          {article.summary && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {article.summary}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {article.category && (
              <span className="flex items-center gap-1">
                <BookOpen className="size-3" />
                {article.category.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {article.view_count}
            </span>
          </div>
        </div>

        {tags && tags.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1 justify-end max-w-[200px]">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs border border-border bg-background"
              >
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
