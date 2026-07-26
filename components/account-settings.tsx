"use client";

import Link from "next/link";
import { ArrowSquareOut, Camera, SignOut, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/providers";
import { PageHeader, Pill, SectionTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export type EditableProfile = {
  display_name: string | null;
  username: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  skills: string[] | null;
  availability_status: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  show_completions: boolean;
  onboarding_completed: boolean | null;
  role: string;
};

export type AccountItem = {
  entity_type: string;
  entity_id: string;
  title: string;
  href: string;
  created_at?: string;
  last_viewed_at?: string;
};

function optionalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const url = new URL(trimmed);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Links must use http or https.");
  return url.toString();
}

function usernameFor(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

export function AccountSettings({
  userId,
  email,
  initialProfile,
  stats,
  savedItems,
  recentViews,
  onboarding = false,
}: {
  userId: string;
  email: string;
  initialProfile: EditableProfile;
  stats: { posts: number; resources: number; progress: number };
  savedItems: AccountItem[];
  recentViews: AccountItem[];
  onboarding?: boolean;
}) {
  const router = useRouter();
  const auth = useAuth();
  const client = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(savedItems);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function field<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!client || busy) return;
    setBusy(true);
    setStatus("");
    try {
      const payload = {
        display_name: profile.display_name?.trim() || null,
        username: usernameFor(profile.username || profile.display_name || ""),
        headline: profile.headline?.trim() || null,
        bio: profile.bio?.trim() || null,
        location: profile.location?.trim() || null,
        website_url: optionalUrl(profile.website_url || ""),
        linkedin_url: optionalUrl(profile.linkedin_url || ""),
        github_url: optionalUrl(profile.github_url || ""),
        skills: (profile.skills || []).map((item) => item.trim()).filter(Boolean).slice(0, 20),
        availability_status: profile.availability_status || "not-looking",
        avatar_url: optionalUrl(profile.avatar_url || ""),
        cover_image_url: optionalUrl(profile.cover_image_url || ""),
        show_completions: profile.show_completions,
        onboarding_completed: onboarding ? true : profile.onboarding_completed,
      };
      if (!payload.display_name || !payload.username) throw new Error("Display name and username are required.");
      const { error } = await client.from("profiles").update(payload).eq("id", userId);
      if (error) throw error;
      setStatus("Profile saved.");
      if (onboarding) router.replace(`/pointstack/people/${payload.username}`);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save the profile.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File | null) {
    if (!client || !file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setStatus("Choose an image smaller than 5 MB.");
      return;
    }
    setBusy(true);
    setStatus("Uploading image…");
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${extension}`;
    const { error } = await client.storage.from("avatars").upload(path, file, { cacheControl: "3600" });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }
    const { data } = client.storage.from("avatars").getPublicUrl(path);
    field("avatar_url", data.publicUrl);
    const { error: updateError } = await client.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId);
    setStatus(updateError ? updateError.message : "Profile image updated.");
    setBusy(false);
  }

  async function removeSaved(item: AccountItem) {
    if (!client) return;
    const { error } = await client.from("user_saved_items").delete().eq("user_id", userId).eq("entity_type", item.entity_type).eq("entity_id", item.entity_id);
    if (!error) setSaved((items) => items.filter((candidate) => candidate.entity_type !== item.entity_type || candidate.entity_id !== item.entity_id));
  }

  const publicPath = profile.username ? `/pointstack/people/${profile.username}` : null;

  return (
    <>
      <PageHeader
        eyebrow={onboarding ? "POINTSTACK / ONBOARDING" : "ACCOUNT / SETTINGS"}
        title={onboarding ? "Build your public profile" : profile.display_name || email}
        description={onboarding ? "Set the basics now. Empty optional sections stay hidden on your public profile." : "Manage your public profile, saved work, course progress, and account access."}
        actions={!onboarding ? <button className="button quiet" type="button" onClick={async () => { await auth.signOut(); router.push("/"); }}><SignOut size={15} /> Sign out</button> : undefined}
      />

      {!onboarding && <section className="account-stats">
        <div><strong>{stats.posts}</strong><span>PointStack posts</span></div>
        <div><strong>{stats.resources}</strong><span>Library entries</span></div>
        <div><strong>{stats.progress}</strong><span>Courses started</span></div>
        <div><strong>{saved.length}</strong><span>Saved items</span></div>
      </section>}

      <form className="account-form" onSubmit={save}>
        <section className="account-card">
          <SectionTitle index="01" title="Identity" action={publicPath && <Link href={publicPath}>View public profile <ArrowSquareOut size={13} /></Link>} />
          <div className="account-avatar-row">
            <div className="account-avatar">{profile.avatar_url ? (
              // Profile images are user-hosted and may use domains not known at build time.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" />
            ) : <span>{(profile.display_name || email).slice(0, 1).toUpperCase()}</span>}</div>
            <label className="button quiet"><Camera size={15} /> Upload image<input className="visually-hidden" type="file" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0] ?? null)} /></label>
            <small>JPG, PNG, or WebP. Maximum 5 MB.</small>
          </div>
          <div className="account-form-grid">
            <label><span>Display name</span><input value={profile.display_name ?? ""} onChange={(event) => field("display_name", event.target.value)} required maxLength={80} /></label>
            <label><span>Username</span><input value={profile.username ?? ""} onChange={(event) => field("username", usernameFor(event.target.value))} required maxLength={48} placeholder="your-name" /></label>
            <label className="wide"><span>Headline</span><input value={profile.headline ?? ""} onChange={(event) => field("headline", event.target.value)} maxLength={180} placeholder="What you do in building automation" /></label>
            <label className="wide"><span>Bio</span><textarea value={profile.bio ?? ""} onChange={(event) => field("bio", event.target.value)} maxLength={2000} rows={5} /></label>
            <label><span>Location</span><input value={profile.location ?? ""} onChange={(event) => field("location", event.target.value)} maxLength={100} /></label>
            <label><span>Availability</span><select value={profile.availability_status ?? "not-looking"} onChange={(event) => field("availability_status", event.target.value)}><option value="not-looking">Not looking</option><option value="available">Available</option><option value="busy">Busy</option></select></label>
            <label className="wide"><span>Skills</span><input value={(profile.skills || []).join(", ")} onChange={(event) => field("skills", event.target.value.split(","))} placeholder="BACnet, Niagara, commissioning" /></label>
          </div>
        </section>

        <section className="account-card">
          <SectionTitle index="02" title="Links and presentation" />
          <div className="account-form-grid">
            <label><span>Website</span><input type="url" value={profile.website_url ?? ""} onChange={(event) => field("website_url", event.target.value)} /></label>
            <label><span>LinkedIn</span><input type="url" value={profile.linkedin_url ?? ""} onChange={(event) => field("linkedin_url", event.target.value)} /></label>
            <label><span>GitHub</span><input type="url" value={profile.github_url ?? ""} onChange={(event) => field("github_url", event.target.value)} /></label>
            <label><span>Cover image URL</span><input type="url" value={profile.cover_image_url ?? ""} onChange={(event) => field("cover_image_url", event.target.value)} /></label>
          </div>
          <label className="check-field"><input type="checkbox" checked={profile.show_completions} onChange={(event) => field("show_completions", event.target.checked)} /> Show course completions on my public profile</label>
        </section>

        <div className="account-save-row">
          <button className="button primary" type="submit" disabled={busy}>{busy ? "Saving…" : onboarding ? "Finish profile" : "Save changes"}</button>
          {status && <p className="form-status" role="status">{status}</p>}
          {!onboarding && <span><Pill>{profile.role}</Pill><small>{email}</small></span>}
        </div>
      </form>

      {!onboarding && <div className="account-lists">
        <section className="account-card">
          <SectionTitle index="03" title="Saved" />
          {saved.length ? <div className="account-item-list">{saved.map((item) => <div key={`${item.entity_type}:${item.entity_id}`}><Link href={item.href}><Pill>{item.entity_type}</Pill><strong>{item.title}</strong></Link><button type="button" aria-label={`Remove ${item.title} from saved items`} onClick={() => removeSaved(item)}><Trash size={14} /></button></div>)}</div> : <p className="account-empty">Items you save across Wiki, News, PointStack, Courses, and Library will appear here.</p>}
        </section>
        <section className="account-card">
          <SectionTitle index="04" title="Recently viewed" />
          {recentViews.length ? <div className="account-item-list">{recentViews.map((item) => <div key={`${item.entity_type}:${item.entity_id}`}><Link href={item.href}><Pill>{item.entity_type}</Pill><strong>{item.title}</strong></Link><small>{item.last_viewed_at ? new Date(item.last_viewed_at).toLocaleDateString() : ""}</small></div>)}</div> : <p className="account-empty">Your recent signed-in reading history will appear here.</p>}
        </section>
      </div>}
    </>
  );
}
