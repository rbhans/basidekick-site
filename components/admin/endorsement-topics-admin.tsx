"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  EndorsementTopic,
  upsertEndorsementTopicSchema,
} from "@/lib/schemas/endorsements";
import {
  deleteEndorsementTopic,
  upsertEndorsementTopic,
} from "@/lib/endorsements/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  initialTopics: EndorsementTopic[];
  wikiCategories: WikiCategory[];
}

interface FormState {
  id?: string;
  slug: string;
  name: string;
  description: string;
  wiki_category_id: string; // "" = none
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  description: "",
  wiki_category_id: "",
  icon_name: "",
  display_order: 0,
  is_active: true,
};

export function EndorsementTopicsAdmin({
  initialTopics,
  wikiCategories,
}: Props) {
  const [topics, setTopics] = useState(initialTopics);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleEdit = (topic: EndorsementTopic) => {
    setForm({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      description: topic.description ?? "",
      wiki_category_id: topic.wiki_category_id ?? "",
      icon_name: topic.icon_name ?? "",
      display_order: topic.display_order,
      is_active: topic.is_active,
    });
  };

  const handleReset = () => setForm(EMPTY_FORM);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = upsertEndorsementTopicSchema.safeParse({
      id: form.id,
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      wiki_category_id: form.wiki_category_id || null,
      icon_name: form.icon_name.trim() || null,
      display_order: form.display_order,
      is_active: form.is_active,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid topic");
      return;
    }

    setSaving(true);
    try {
      const saved = await upsertEndorsementTopic(parsed.data);
      setTopics((prev) => {
        const without = prev.filter((t) => t.id !== saved.id);
        return [...without, saved].sort(
          (a, b) =>
            a.display_order - b.display_order || a.name.localeCompare(b.name)
        );
      });
      toast.success(form.id ? "Topic updated." : "Topic created.");
      setForm(EMPTY_FORM);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (topic: EndorsementTopic) => {
    if (
      !confirm(
        `Delete topic "${topic.name}"? This removes every endorsement attached to it.`
      )
    ) {
      return;
    }
    try {
      await deleteEndorsementTopic(topic.id);
      setTopics((prev) => prev.filter((t) => t.id !== topic.id));
      toast.success("Topic deleted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Endorsement Topics</h1>

      <section className="mb-10 border border-border rounded-sm bg-card p-4">
        <h2 className="text-sm font-semibold mb-4">
          {form.id ? "Edit topic" : "New topic"}
        </h2>
        <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="niagara"
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Niagara"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="wiki_category_id">Linked wiki category</Label>
            <select
              id="wiki_category_id"
              className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              value={form.wiki_category_id}
              onChange={(e) =>
                setForm({ ...form, wiki_category_id: e.target.value })
              }
            >
              <option value="">(none)</option>
              {wikiCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="display_order">Display order</Label>
            <Input
              id="display_order"
              type="number"
              value={form.display_order}
              onChange={(e) =>
                setForm({
                  ...form,
                  display_order: Number.parseInt(e.target.value || "0", 10),
                })
              }
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : form.id ? "Update topic" : "Create topic"}
            </Button>
            {form.id && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">
          All topics ({topics.length})
        </h2>
        <ul className="divide-y divide-border border border-border rounded-sm bg-card">
          {topics.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.name}</span>
                  <code className="text-xs text-muted-foreground">{t.slug}</code>
                  {!t.is_active && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground border px-1 rounded-sm">
                      inactive
                    </span>
                  )}
                </div>
                {t.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {t.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {t.display_order}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleEdit(t)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDelete(t)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
