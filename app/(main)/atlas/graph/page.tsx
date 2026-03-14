import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasGraph } from "@/components/atlas/atlas-graph";

export const metadata: Metadata = {
  title: "Equipment & Point Relationships | BAS Atlas",
  description: "Interactive graph visualization of BAS equipment and their typical points",
};

export default function GraphPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <Suspense fallback={<div className="flex h-full items-center justify-center">Loading graph...</div>}>
        <AtlasGraph />
      </Suspense>
    </div>
  );
}
