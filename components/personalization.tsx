"use client";

import { BookmarkSimple } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";

export type PersonalizationKind = "news" | "wiki" | "pointstack" | "library" | "course";

export function SaveButton({ kind, entityId, title, href }: { kind: PersonalizationKind; entityId: string; title: string; href?: string }) {
  const auth = useAuth();
  const client = useMemo(() => createClient(), []);
  const saveKey = `${kind}:${entityId}`;
  const [savedRecord, setSavedRecord] = useState<{ userId: string; key: string; saved: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const saved = Boolean(auth.user && savedRecord?.userId === auth.user.id && savedRecord.key === saveKey && savedRecord.saved);

  useEffect(() => {
    if (!client || !auth.user) return;
    const userId = auth.user.id;
    let active = true;
    client.from("user_saved_items").select("entity_id").eq("user_id", auth.user.id).eq("entity_type", kind).eq("entity_id", entityId).maybeSingle()
      .then(({ data }) => {
        if (active) setSavedRecord({ userId, key: saveKey, saved: Boolean(data) });
      });
    return () => {
      active = false;
    };
  }, [auth.user, client, entityId, kind, saveKey]);

  async function toggle() {
    if (!auth.user) {
      auth.requestSignIn("save this entry", href ?? window.location.pathname);
      return;
    }
    if (!client || busy) return;
    setBusy(true);
    const destination = href ?? window.location.pathname;
    const result = saved
      ? await client.from("user_saved_items").delete().eq("user_id", auth.user.id).eq("entity_type", kind).eq("entity_id", entityId)
      : await client.from("user_saved_items").upsert({
          user_id: auth.user.id,
          entity_type: kind,
          entity_id: entityId,
          title: title.slice(0, 240),
          href: destination,
        }, { onConflict: "user_id,entity_type,entity_id" });
    if (!result.error) setSavedRecord({ userId: auth.user.id, key: saveKey, saved: !saved });
    setBusy(false);
  }

  return <button type="button" className={saved ? "active" : ""} disabled={busy} onClick={toggle}><BookmarkSimple size={16} weight={saved ? "fill" : "regular"} /> {saved ? "Saved" : "Save"}</button>;
}

export function RecentViewTracker({ kind, entityId, title, href }: { kind: PersonalizationKind; entityId: string; title: string; href?: string }) {
  const auth = useAuth();
  const client = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!client || !auth.user) return;
    void client.from("user_recent_views").upsert({
      user_id: auth.user.id,
      entity_type: kind,
      entity_id: entityId,
      title: title.slice(0, 240),
      href: href ?? window.location.pathname,
      last_viewed_at: new Date().toISOString(),
    }, { onConflict: "user_id,entity_type,entity_id" });
  }, [auth.user, client, entityId, href, kind, title]);

  return null;
}
