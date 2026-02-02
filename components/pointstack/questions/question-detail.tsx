"use client";

import { PointStackPostDetail } from "../feed/post-detail";

interface QuestionDetailProps {
  slug: string;
}

export function PointStackQuestionDetail({ slug }: QuestionDetailProps) {
  return <PointStackPostDetail slug={slug} />;
}
