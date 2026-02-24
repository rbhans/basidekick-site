import { redirect } from "next/navigation";

interface LegacyBabelEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyBabelEntryPage({ params }: LegacyBabelEntryPageProps) {
  const { id } = await params;
  redirect(`/atlas/${encodeURIComponent(id)}`);
}
