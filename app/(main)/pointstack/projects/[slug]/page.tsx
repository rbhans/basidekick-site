import { PointStackProjectDetail } from "@/components/pointstack/projects/project-detail";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  return {
    title: `Project - PointStack`,
    description: `View project details on PointStack`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  return <PointStackProjectDetail slug={slug} />;
}
