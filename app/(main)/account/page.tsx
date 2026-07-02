import type { Metadata } from "next";
import { AccountView } from "@/components/views/account-view";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountView />;
}
