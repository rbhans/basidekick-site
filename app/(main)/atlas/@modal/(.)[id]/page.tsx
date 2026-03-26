import { getBabelEntry } from "@/lib/data/babel";
import { BabelEntryModal } from "@/components/babel/babel-entry-modal";

interface AtlasEntryModalPageProps {
  params: Promise<{ id: string }>;
}

export default async function AtlasEntryModalPage({ params }: AtlasEntryModalPageProps) {
  const { id } = await params;
  const entry = await getBabelEntry(id);

  if (!entry) {
    return null;
  }

  return <BabelEntryModal entry={entry.data} type={entry.type} />;
}
