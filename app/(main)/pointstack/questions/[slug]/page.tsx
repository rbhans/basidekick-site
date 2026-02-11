import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

interface QuestionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { slug } = await params;
  redirect(ROUTES.POINTSTACK_POST(slug));
}
