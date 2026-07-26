import type { Metadata } from "next";
import { RecordDetail } from "@/components/feature-pages";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <RecordDetail section="Legal" title="Privacy" summary="BASidekick collects only the account and activity data needed to operate the workspace." body="Public pages can be read without an account. When you sign in, BASidekick uses the existing authentication service to maintain your session and associate voluntary actions such as bookmarks, posts, votes, comments, messages, course progress, and submissions with your profile. External resources and creator sites have their own privacy practices." />;
}
