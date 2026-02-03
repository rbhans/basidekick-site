import { EquipmentModelView } from "@/components/atlas/equipment-model-view";

interface ModelPageProps {
  params: Promise<{ brand: string; type: string; model: string }>;
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { brand, type, model } = await params;
  return <EquipmentModelView brandSlug={brand} typeSlug={type} modelSlug={model} />;
}
