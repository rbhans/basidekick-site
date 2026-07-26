import { redirect } from "next/navigation";

export default async function QuestionCompatibilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/pointstack/posts/${encodeURIComponent(slug)}`);
}
