import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Entry - Community Share",
  description: "View a shared BAS community entry.",
};

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  redirect(ROUTES.COMMUNITY_SHARE_ENTRY(slug));
}
