import { PSKClientView } from "@/components/views/psk-client-view";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { id } = await params;
  return <PSKClientView clientId={id} />;
}
