import { redirect } from "next/navigation";

interface LegacyEquipmentModelPageProps {
  params: Promise<{ brand: string; type: string; model: string }>;
}

export default async function LegacyEquipmentModelPage({ params }: LegacyEquipmentModelPageProps) {
  const { brand, type, model } = await params;
  redirect(
    `/atlas/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}/${encodeURIComponent(model)}`
  );
}
