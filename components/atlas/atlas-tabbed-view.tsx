"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Broom, Plus, BookOpen } from "@phosphor-icons/react";
import { SiteBadge } from "@/components/site-badge";
import { PageHero } from "@/components/page-hero";
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
      {/* Hero */}
      <PageHero centered imageSrc="/images/hero/resources.png">
        <div className="flex justify-center">
          <SiteBadge label="RESOURCES" icon={BookOpen} />
        </div>
        <h1 className="mt-6 text-3xl md:text-[42px] font-heading font-bold tracking-tight">
          BAS Atlas
        </h1>
        <p className="mt-3 text-muted-foreground max-w-[600px] mx-auto text-lg">
          The unified reference for point definitions, equipment catalogs, and naming conventions.
          Built on Haystack and Brick standards.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ROUTES.ATLAS_CLEANER}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-[#d4ff5a] transition-colors"
          >
            <Broom className="size-4" weight="bold" />
            Point Name Cleaner
          </Link>
          <Link
            href={ROUTES.ATLAS_EQUIPMENT_ADD}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold border border-border rounded-lg hover:border-muted-foreground transition-colors"
          >
            <Plus className="size-4" weight="bold" />
            Add Equipment
          </Link>
        </div>
      </PageHero>

      {/* Tabs — uses shadcn Tabs for ARIA tab/tabpanel semantics */}
      <section className="pt-6 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <div className="flex justify-center mb-8">
              <TabsList className="bg-transparent gap-2 p-0">
                <TabsTrigger
                  value="points"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
                >
                  Point Definitions
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
                >
                  Equipment Catalog
                </TabsTrigger>
              </TabsList>
            </div>

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
