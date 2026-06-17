import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function ToolsPage() {
  redirect(ROUTES.OPEN_SOURCE);
}
