"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Broom, Plus } from "@phosphor-icons/react";
import { CircuitBackground } from "@/components/circuit-background";
import { SectionLabel } from "@/components/section-label";
import { BabelViewContent } from "@/components/babel/babel-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/routes";
import { EquipmentBrowseContent } from "./equipment-browse-view";

type AtlasTab = "points" | "equipment";

export function AtlasTabbedView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab: AtlasTab = useMemo(() => {
    const tab = searchParams.get("tab");
    return tab === "equipment" ? "equipment" : "points";
  }, [searchParams]);

  const onTabChange = (value: string) => {
    const nextTab: AtlasTab = value === "equipment" ? "equipment" : "points";
    const params = new URLSearchParams(searchParams.toString());

    if (nextTab === "equipment") {
      params.set("tab", "equipment");
    } else {
      params.delete("tab");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="min-h-full">
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel variant="resources">resources</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">BAS Atlas</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Unified BAS reference for point naming standards and equipment catalog browsing.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.ATLAS_CLEANER}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              <Broom className="size-4" weight="bold" />
              Point Name Cleaner
            </Link>
            <Link
              href={ROUTES.ATLAS_EQUIPMENT_ADD}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              <Plus className="size-4" weight="bold" />
              Add Equipment
            </Link>
          </div>
        </div>
      </section>

      <section className="pt-6">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList>
              <TabsTrigger value="points">Types</TabsTrigger>
              <TabsTrigger value="equipment">Models</TabsTrigger>
            </TabsList>
            <TabsContent value="points">
              <BabelViewContent />
            </TabsContent>
            <TabsContent value="equipment">
              <EquipmentBrowseContent />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
