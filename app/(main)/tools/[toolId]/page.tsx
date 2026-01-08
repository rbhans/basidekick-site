import { notFound } from "next/navigation";
import { ToolDetailView } from "@/components/views/tool-detail-view";

// Valid tool IDs
const VALID_TOOL_IDS = ["nsk", "ssk", "msk", "qsk"] as const;
type ValidToolId = (typeof VALID_TOOL_IDS)[number];

interface ToolPageProps {
  params: Promise<{ toolId: string }>;
}

export function generateStaticParams() {
  return VALID_TOOL_IDS.map((toolId) => ({ toolId }));
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolId } = await params;

  // Validate tool ID
  if (!VALID_TOOL_IDS.includes(toolId as ValidToolId)) {
    notFound();
  }

  return <ToolDetailView toolId={toolId as ValidToolId} />;
}
