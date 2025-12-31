import { PSKProjectView } from "@/components/views/psk-project-view";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  return <PSKProjectView projectId={id} />;
}
