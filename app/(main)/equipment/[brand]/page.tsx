import { redirect } from "next/navigation";

interface LegacyEquipmentBrandPageProps {
  params: Promise<{ brand: string }>;
}

export default async function LegacyEquipmentBrandPage({ params }: LegacyEquipmentBrandPageProps) {
  const { brand } = await params;
  redirect(`/atlas/equipment/${encodeURIComponent(brand)}`);
}
