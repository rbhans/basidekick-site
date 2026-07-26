import { PointStackView, type PointStackPersonItem } from "@/components/feature-pages";
import { fetchProfiles } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function PeoplePage() { let items: PointStackPersonItem[] = []; try { const people = await fetchProfiles(await createServerReadClient()); items = people.filter((person) => person.display_name).map((person) => ({ username: person.username ?? person.display_name!.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), name: person.display_name!, headline: person.headline ?? "Building automation practitioner", location: person.location ?? "BAS community", verified: person.is_verified })); } catch {} return <PointStackView mode="people" initialPeople={items.length ? items : undefined} />; }
