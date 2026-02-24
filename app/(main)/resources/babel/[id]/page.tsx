import { redirect } from "next/navigation";

interface LegacyResourcesBabelEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyResourcesBabelEntryPage({
  params,
}: LegacyResourcesBabelEntryPageProps) {
  const { id } = await params;
  redirect(`/atlas/${encodeURIComponent(id)}`);
}
