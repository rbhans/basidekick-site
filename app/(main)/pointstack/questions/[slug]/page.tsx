import { PointStackQuestionDetail } from "@/components/pointstack/questions/question-detail";

interface QuestionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: QuestionPageProps) {
  const { slug } = await params;
  return {
    title: `Question - PointStack Q&A`,
    description: `View question and answers on PointStack`,
  };
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { slug } = await params;
  return <PointStackQuestionDetail slug={slug} />;
}
