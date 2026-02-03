import { EquipmentBrandView } from "@/components/atlas/equipment-brand-view";

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { brand } = await params;
  return <EquipmentBrandView brandSlug={brand} />;
}
