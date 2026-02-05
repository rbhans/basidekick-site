"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { BabelEntryDetail } from "@/components/babel";
import { createClient } from "@/lib/supabase/client";
import type { BabelEquipmentEntry, BabelPointEntry } from "@/lib/types";

interface BabelEntryPageClientProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
}

export function BabelEntryPageClient({ entry, type }: BabelEntryPageClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsAuthenticated(!!session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <BabelEntryDetail entry={entry} type={type} isAuthenticated={isAuthenticated} />;
}
