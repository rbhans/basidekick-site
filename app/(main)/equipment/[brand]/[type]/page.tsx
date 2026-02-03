import { EquipmentTypeView } from "@/components/atlas/equipment-type-view";

interface TypePageProps {
  params: Promise<{ brand: string; type: string }>;
}

export default async function TypePage({ params }: TypePageProps) {
  const { brand, type } = await params;
  return <EquipmentTypeView brandSlug={brand} typeSlug={type} />;
}
