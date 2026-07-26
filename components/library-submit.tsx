"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function LibrarySubmit() {
  const auth = useAuth();
  const [status, setStatus] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.user) { auth.requestSignIn("submit a Library entry"); return; }
    const form = new FormData(event.currentTarget);
    const client = createClient();
    if (!client) { setStatus("Supabase is not configured in this preview."); return; }
    const title = String(form.get("title") || "").trim();
    const { error } = await client.from("pointstack_resource_listings").insert({ author_id: auth.user.id, title, slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`, description: String(form.get("description") || ""), category: String(form.get("category") || "other"), tags: String(form.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 20), is_free: form.get("access") === "free", external_link: String(form.get("url") || "") });
    setStatus(error ? error.message : "Published. Your Library entry is live and available from your account.");
    if (!error) event.currentTarget.reset();
  }
  return <><PageHeader eyebrow="TOOLS / LIBRARY / SUBMIT" title="Submit a resource" description="Share software, modules, scripts, templates, guides, documents, files, or useful external resources." /><form className="submission-form" onSubmit={submit}><label><span>Title</span><input name="title" required /></label><label><span>Description</span><textarea name="description" rows={5} required /></label><div><label><span>Category</span><select name="category"><option value="tool">Tool / software</option><option value="template">Template</option><option value="script">Script</option><option value="document">Document / PDF</option><option value="guide">Guide</option><option value="other">Other</option></select></label><label><span>Access</span><select name="access"><option value="free">Free</option><option value="paid">Paid externally</option></select></label></div><label><span>Tags</span><input name="tags" placeholder="BACnet, Niagara, commissioning" /></label><label><span>Creator or download URL</span><input name="url" type="url" required /></label><p>BASidekick does not process payment. Paid entries must link directly to the creator’s checkout or product page.</p><button className="button primary" type="submit">Publish to Library</button></form>{status && <p className="form-status" role="status">{status}</p>}</>;
}
