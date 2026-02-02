import { PointStackJobDetail } from "@/components/pointstack/jobs/job-detail";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobPageProps) {
  const { slug } = await params;
  return {
    title: `Job - PointStack`,
    description: `View job details and apply on PointStack`,
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  return <PointStackJobDetail slug={slug} />;
}
