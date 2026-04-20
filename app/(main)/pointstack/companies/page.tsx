import { PointStackCompaniesView } from "@/components/pointstack/company/companies-view";

export const metadata = {
  title: "Companies — BASidekick",
  description: "Discover BAS companies and organizations in the PointStack community.",
};

export default function CompaniesPage() {
  return <PointStackCompaniesView />;
}
