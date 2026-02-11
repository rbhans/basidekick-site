import { ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  redirect(ROUTES.POINTSTACK_POST(slug));
}
