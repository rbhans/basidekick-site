"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Check, ChatCircle, Eye, Plus, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { usePointStackStore } from "../pointstack-store";
import { UserAvatar } from "../shared/user-avatar";
import { CreatePostDialog } from "../feed/create-post-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES, getPointStackPostRoute } from "@/lib/routes";

export function PointStackQuestionsView() {
  const { user } = useAuth();
  const { posts, feedLoading, feedError, setFeedFilter } = usePointStackStore();
  const { data: atlasData } = useAtlasData();

  useEffect(() => {
    setFeedFilter({ type: "question" });
  }, [setFeedFilter]);

  const questions = posts.filter((p) => p.post_type === "question");

  const brandById = useMemo(() => new Map(atlasData?.brands.map((b) => [b.id, b]) || []), [atlasData]);
  const typeById = useMemo(() => new Map(atlasData?.types.map((t) => [t.id, t]) || []), [atlasData]);
  const modelById = useMemo(() => new Map(atlasData?.models.map((m) => [m.id, m]) || []), [atlasData]);

  const getEquipmentLinks = (ids: string[] = []) => {
    if (!atlasData) return [];
    return ids
      .map((id) => {
        const model = modelById.get(id);
        if (!model) return null;
        const brand = brandById.get(model.brand);
        const type = typeById.get(model.type);
        if (!brand || !type) return null;
        return {
          id,
          name: model.name,
          href: ROUTES.ATLAS_EQUIPMENT_MODEL(brand.slug || brand.id, type.slug || type.id, model.slug || model.id),
        };
      })
      .filter(Boolean) as { id: string; name: string; href: string }[];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold">Questions & Answers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions and get answers from the community.
          </p>
        </div>
        {user && (
          <CreatePostDialog
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ask Question
              </Button>
            }
            defaultType="question"
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFeedFilter({ type: "question", sortBy: "recent" })}
        >
          Recent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFeedFilter({ type: "question", sortBy: "unanswered" })}
        >
          Unanswered
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFeedFilter({ type: "question", sortBy: "popular" })}
        >
          Popular
        </Button>
      </div>

      {/* Error state */}
      {feedError && (
        <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border/40 rounded-xl bg-card text-center">
          <WarningCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{feedError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setFeedFilter({ type: "question" })}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {feedLoading && questions.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((question) => {
            const hasAcceptedAnswer = Boolean(question.metadata?.hasAcceptedAnswer);
            return (
              <Link
                key={question.id}
                href={getPointStackPostRoute(question.post_type, question.slug)}
                className="block p-5 border border-border/40 rounded-xl bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Stats */}
                  <div className="hidden sm:flex flex-col items-center gap-2 text-center min-w-[60px]">
                    <div className={question.upvote_count > 0 ? "text-primary" : "text-muted-foreground"}>
                      <p className="text-lg font-semibold">{question.upvote_count}</p>
                      <p className="text-xs">votes</p>
                    </div>
                    <div className={hasAcceptedAnswer ? "text-green-600" : question.comment_count > 0 ? "text-foreground" : "text-muted-foreground"}>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        {hasAcceptedAnswer && <Check className="w-4 h-4" />}
                        {question.comment_count}
                      </p>
                      <p className="text-xs">answers</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 hover:text-primary">
                      {question.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {question.content.slice(0, 200)}
                      {question.content.length > 200 && "..."}
                    </p>

                    {/* Tags */}
                    {question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {question.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {question.equipment_ids && question.equipment_ids.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {getEquipmentLinks(question.equipment_ids).map((item) => (
                          <Link key={item.id} href={item.href}>
                            <Badge variant="secondary" className="text-xs">
                              {item.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <UserAvatar
                          displayName={question.author?.display_name || null}
                          avatarUrl={question.author?.avatar_url}
                          size="sm"
                        />
                        <span>{question.author?.display_name || "Anonymous"}</span>
                      </div>
                      <span>asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                      <div className="flex items-center gap-1 sm:hidden">
                        <ChatCircle className="w-3 h-3" />
                        <span>{question.comment_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{question.view_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!feedLoading && questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No questions yet. Be the first to ask!
          </p>
          {user && (
            <CreatePostDialog
              trigger={
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </Button>
              }
              defaultType="question"
            />
          )}
        </div>
      )}
    </div>
  );
}
