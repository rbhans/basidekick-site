import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Community Share - BASidekick",
  description: "Community BAS links, files, projects, and references.",
};

export default function ResourcesPage() {
  redirect(ROUTES.OPEN_SOURCE);
}
