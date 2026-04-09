"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getBabelIdsForAtlasType } from "@/lib/data/atlas-babel-map";
import { useAtlasAll } from "./use-atlas-data";
import { useBabelData } from "@/components/babel/use-babel-data";
import { getBrandBySlug, getTypeBySlug, getModelBySlug } from "./atlas-utils";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { EquipmentImageUpload } from "./equipment-image-upload";
import { EquipmentNotes } from "./equipment-notes";
import { UserAvatar } from "@/components/user-avatar";

interface EquipmentModelViewProps {
  brandSlug: string;
  typeSlug: string;
  modelSlug: string;
}

interface EquipmentImage {
  id: string;
  url: string;
  is_primary?: boolean;
}

interface EquipmentPerson {
  user_id: string;
  user?: { display_name: string | null; avatar_url: string | null } | null;
}

function formatBabelEquipmentLabel(babelId: string): string {
  return babelId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function PointStandardsList({ atlasTypeId }: { atlasTypeId: string }) {
  const babelIds = useMemo(() => getBabelIdsForAtlasType(atlasTypeId), [atlasTypeId]);
  const { data: babelData, loading: babelLoading } = useBabelData();

  const linkedEquipment = useMemo(() => {
    const equipmentById = new Map(
      (babelData?.equipment ?? []).map((entry) => [entry.id, entry] as const)
    );

    return babelIds.map((babelId) => {
      const entry = equipmentById.get(babelId);
      return {
        id: babelId,
        name: entry?.name ?? formatBabelEquipmentLabel(babelId),
        abbreviation: entry?.abbreviation,
        isBroken: !babelLoading && !entry,
      };
    });
  }, [babelData, babelIds, babelLoading]);

  if (babelIds.length === 0) return null;

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-3 pb-2 border-b border-foreground">
        Point standards
      </div>
      <ul className="space-y-2">
        {linkedEquipment.map((entry) => (
          <li key={entry.id}>
            {entry.isBroken ? (
              <span className="font-heading italic text-[14px] text-destructive">
                {entry.name} (broken mapping)
              </span>
            ) : (
              <Link
                href={ROUTES.ATLAS_ENTRY(entry.id)}
                className="font-heading text-[14px] text-foreground hover:text-accent transition-colors"
              >
                {entry.name}
                {entry.abbreviation ? (
                  <span className="text-muted-foreground italic"> ({entry.abbreviation})</span>
                ) : null}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EquipmentModelView({ brandSlug, typeSlug, modelSlug }: EquipmentModelViewProps) {
  const { user } = useAuth();
  const { data, loading, error } = useAtlasAll();
  const [images, setImages] = useState<EquipmentImage[]>([]);
  const [people, setPeople] = useState<EquipmentPerson[]>([]);
  const [experienceCount, setExperienceCount] = useState(0);
  const [hasWorked, setHasWorked] = useState(false);

  const brand = data ? getBrandBySlug(data, brandSlug) : undefined;
  const type = data ? getTypeBySlug(data, typeSlug) : undefined;
  const model = data ? getModelBySlug(data, brandSlug, typeSlug, modelSlug) : undefined;

  const primaryImage = useMemo(() => {
    if (model?.image_url) return model.image_url;
    const primary = images.find((img) => img.is_primary);
    return primary?.url || images[0]?.url || "";
  }, [model, images]);

  useEffect(() => {
    const fetchExtras = async () => {
      if (!model) return;
      const supabase = createClient();
      if (!supabase) return;

      const [imagesResult, experienceResult, peopleResult] = await Promise.all([
        supabase
          .from("equipment_images")
          .select("id, url, is_primary")
          .eq("equipment_id", model.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("equipment_experience")
          .select("user_id", { count: "exact", head: true })
          .eq("equipment_id", model.id),
        supabase
          .from("equipment_experience")
          .select("user_id, user:profiles(display_name, avatar_url)")
          .eq("equipment_id", model.id)
          .limit(12),
      ]);

      if (imagesResult.data) {
        setImages(imagesResult.data as EquipmentImage[]);
      }

      if (experienceResult.count !== null) {
        setExperienceCount(experienceResult.count || 0);
      }

      if (peopleResult.data) {
        setPeople(peopleResult.data as EquipmentPerson[]);
      }

      if (user) {
        const { data: existing } = await supabase
          .from("equipment_experience")
          .select("user_id")
          .eq("equipment_id", model.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setHasWorked(Boolean(existing));
      }
    };

    fetchExtras();
  }, [model, user]);

  const toggleExperience = async () => {
    if (!model || !user) return;
    const supabase = createClient();
    if (!supabase) return;

    if (!hasWorked) {
      const { error: insertError } = await supabase
        .from("equipment_experience")
        .insert({ equipment_id: model.id, user_id: user.id });
      if (!insertError) {
        setHasWorked(true);
        setExperienceCount((c) => c + 1);
      }
    } else {
      const { error: deleteError } = await supabase
        .from("equipment_experience")
        .delete()
        .eq("equipment_id", model.id)
        .eq("user_id", user.id);
      if (!deleteError) {
        setHasWorked(false);
        setExperienceCount((c) => Math.max(0, c - 1));
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <p className="font-heading italic text-[17px] text-muted-foreground">
          Failed to load BAS Atlas data
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <section className="container mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16 py-10">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-10 w-96 mb-8" />
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (!model || !brand || !type) {
    return (
      <div className="py-24 text-center font-heading italic text-[18px] text-muted-foreground">
        Equipment model not found.
      </div>
    );
  }

  const statusLabel = (model.status || "current").toString();

  return (
    <section className="container mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Back link */}
      <Link
        href={ROUTES.ATLAS_EQUIPMENT_TYPE(brand.slug || brand.id, type.slug || type.id)}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors mb-6"
      >
        <span className="text-accent">←</span>
        Back to {type.name}
      </Link>

      {/* Header */}
      <div className="pb-5 border-b border-foreground mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
          <Link
            href={ROUTES.ATLAS_EQUIPMENT_BRAND(brand.slug || brand.id)}
            className="hover:text-accent transition-colors"
          >
            {brand.name}
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link
            href={ROUTES.ATLAS_EQUIPMENT_TYPE(brand.slug || brand.id, type.slug || type.id)}
            className="hover:text-accent transition-colors"
          >
            {type.name}
          </Link>
        </div>
        <h1 className="font-heading font-semibold text-[32px] md:text-[40px] leading-[1.05] text-foreground">
          {model.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
          {model.model_numbers && model.model_numbers.length > 0 && (
            <span className="tabular-nums">{model.model_numbers.join(" · ")}</span>
          )}
          {model.protocols && model.protocols.length > 0 && (
            <span className="text-accent">{model.protocols.join(" · ")}</span>
          )}
          <span className={statusLabel === "discontinued" ? "text-destructive" : "text-accent"}>
            {statusLabel}
          </span>
          <span className="tabular-nums">
            {experienceCount} worked with this
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
        <div className="space-y-12">
          {/* 01 / Overview */}
          <div>
            <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
              <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
              <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
                Overview
              </h2>
            </div>

            {/* Primary image */}
            <div className="border border-border bg-card mb-6">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={model.name}
                  className="w-full max-h-[360px] object-contain p-4"
                />
              ) : (
                <div className="h-56 flex items-center justify-center font-heading italic text-[15px] text-muted-foreground">
                  No image yet
                </div>
              )}
            </div>

            {/* Spec list */}
            <dl className="border-t border-b border-foreground">
              <SpecRow label="Model numbers" value={model.model_numbers?.join(", ") || "—"} />
              <SpecRow label="Protocols" value={model.protocols?.length ? model.protocols.join(", ") : "—"} />
              <SpecRow label="Status" value={statusLabel} />
              <SpecRow
                label="Manufacturer"
                value={
                  model.manufacturer_url ? (
                    <a
                      href={model.manufacturer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
                    >
                      Visit manufacturer →
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              {model.description && (
                <SpecRow label="Description" value={model.description} />
              )}
            </dl>
          </div>

          {/* 02 / Photos */}
          <div>
            <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
              <span className="font-mono text-[11px] text-accent tracking-[1px]">02 /</span>
              <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
                Photos
              </h2>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                {images.length} {images.length === 1 ? "photo" : "photos"}
              </span>
              <div className="ml-3.5">
                <EquipmentImageUpload
                  equipmentId={model.id}
                  onUploaded={(image) => setImages((prev) => [{ id: image.id, url: image.url }, ...prev])}
                />
              </div>
            </div>

            {images.length === 0 ? (
              <p className="font-heading italic text-[15px] text-muted-foreground">No photos yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.url}
                    alt="Equipment"
                    className="w-full h-36 object-cover border border-border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* 03 / Notes */}
          <div>
            <EquipmentNotes equipmentId={model.id} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Experience button */}
          <div>
            <button
              onClick={toggleExperience}
              disabled={!user}
              className={`w-full py-3 border font-mono text-[11px] uppercase tracking-[1.2px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                hasWorked
                  ? "bg-accent text-accent-foreground border-foreground hover:bg-accent/90"
                  : "bg-card text-foreground border-foreground hover:bg-muted"
              }`}
            >
              {hasWorked ? "✓ Worked with this" : "I've worked with this"}
            </button>
            <p className="font-heading italic text-[13px] text-muted-foreground mt-2 text-center">
              {experienceCount} {experienceCount === 1 ? "person has" : "people have"} worked with this
            </p>
          </div>

          {/* People */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-3 pb-2 border-b border-foreground">
              People
            </div>
            {people.length === 0 ? (
              <p className="font-heading italic text-[13px] text-muted-foreground">
                No one yet. Be the first.
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {people.map((person) => (
                  <Link
                    key={person.user_id}
                    href={ROUTES.POINTSTACK_PROFILE(person.user?.display_name || "")}
                    className="block"
                    title={person.user?.display_name || "Anonymous"}
                  >
                    <UserAvatar
                      name={person.user?.display_name || "Anonymous"}
                      avatarUrl={person.user?.avatar_url}
                      size="sm"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Point standards */}
          {getBabelIdsForAtlasType(model.type).length > 0 ? (
            <PointStandardsList atlasTypeId={model.type} />
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-border last:border-b-0">
      <dt className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-[14px] text-foreground leading-[1.55]">{value}</dd>
    </div>
  );
}
