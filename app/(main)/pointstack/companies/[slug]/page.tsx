import { PointStackCompanyView } from "@/components/pointstack/company/company-view";

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { slug } = await params;
  return {
    title: `${slug} — BASidekick`,
    description: `View company profile on PointStack`,
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  return <PointStackCompanyView slug={slug} />;
}
