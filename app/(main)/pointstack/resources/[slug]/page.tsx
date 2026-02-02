import { PointStackResourceDetail } from "@/components/pointstack/resources/resource-detail";

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResourcePageProps) {
  const { slug } = await params;
  return {
    title: `Resource - PointStack`,
    description: `View and download resource on PointStack`,
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  return <PointStackResourceDetail slug={slug} />;
}
