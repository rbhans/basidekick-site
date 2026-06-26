"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionBar } from "./section-bar";
import { CompletionsTab, type CompletionsCatalogEntry } from "./completions-tab";
import { PendingTab } from "./pending-tab";
import { BookmarksTab } from "./bookmarks-tab";

const TRIGGER_CLS =
  "rounded-none pb-2 font-mono text-[11px] uppercase tracking-[0.12em] data-[state=active]:-mb-px data-[state=active]:rounded-none data-[state=active]:border-b-2 data-[state=active]:border-punch data-[state=active]:bg-transparent data-[state=active]:text-punch";

export function OwnerStrip({
  userId,
  coursesCatalog,
}: {
  userId: string;
  coursesCatalog: CompletionsCatalogEntry[];
}) {
  return (
    <section className="pt-11">
      <SectionBar num="05" title="Your dashboard" meta="Only visible to you" />
      <Tabs defaultValue="completions">
        <TabsList className="mb-6 flex h-auto flex-wrap gap-1 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger value="completions" className={TRIGGER_CLS}>
            Completions
          </TabsTrigger>
          <TabsTrigger value="pending" className={TRIGGER_CLS}>
            Pending
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className={TRIGGER_CLS}>
            Bookmarks
          </TabsTrigger>
        </TabsList>
        <TabsContent value="completions">
          <CompletionsTab userId={userId} isOwner catalog={coursesCatalog} />
        </TabsContent>
        <TabsContent value="pending">
          <PendingTab userId={userId} />
        </TabsContent>
        <TabsContent value="bookmarks">
          <BookmarksTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
