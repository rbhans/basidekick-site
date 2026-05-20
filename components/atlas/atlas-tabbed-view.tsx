"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BabelView } from "@/components/babel/babel-view";

export type AtlasScope = "all" | "points" | "equipment" | "models";

export function AtlasTabbedView() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeScope: AtlasScope = useMemo(() => {
    const scope = searchParams.get("scope");
    if (scope === "points" || scope === "equipment" || scope === "models") return scope;
    return "all";
  }, [searchParams]);

  const onScopeChange = (scope: AtlasScope) => {
    const params = new URLSearchParams(searchParams.toString());
    if (scope === "all") {
      params.delete("scope");
    } else {
      params.set("scope", scope);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return <BabelView scope={activeScope} onScopeChange={onScopeChange} />;
}
