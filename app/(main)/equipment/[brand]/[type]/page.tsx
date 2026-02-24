import { redirect } from "next/navigation";

interface LegacyEquipmentTypePageProps {
  params: Promise<{ brand: string; type: string }>;
}

export default async function LegacyEquipmentTypePage({ params }: LegacyEquipmentTypePageProps) {
  const { brand, type } = await params;
  redirect(`/atlas/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}`);
}
