"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getBabelIdsForAtlasType } from "@/lib/data/atlas-babel-map";
import { useAtlasAll } from "./use-atlas-data";
import { useBabelData } from "@/components/babel/use-babel-data";
import { getBrandBySlug, getTypeBySlug, getModelBySlug } from "./atlas-utils";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { AtlasBreadcrumb } from "./atlas-breadcrumb";
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

function PointStandardsCard({ atlasTypeId }: { atlasTypeId: string }) {
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
    <div className="border border-border bg-card shadow-sm p-4">
      <h2 className="text-sm font-semibold mb-3">Point Standards</h2>
      <ul className="space-y-2">
        {linkedEquipment.map((entry) => (
          <li key={entry.id}>
            {entry.isBroken ? (
              <span className="text-sm text-destructive">
                {entry.name}
                <span className="text-destructive/80"> (broken mapping)</span>
              </span>
            ) : (
              <Link href={ROUTES.BABEL_ENTRY(entry.id)} className="text-sm text-primary hover:underline">
                {entry.name}
                {entry.abbreviation ? (
                  <span className="text-muted-foreground"> ({entry.abbreviation})</span>
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
      const ok = window.confirm("Add to your experience?");
      if (!ok) return;
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
      <div className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load BAS Atlas data</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!model || !brand || !type) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Equipment model not found.
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <section className="relative py-10 overflow-hidden">
        <CircuitBackground opacity={0.12} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel variant="resources">equipment</SectionLabel>
          <AtlasBreadcrumb
            items={[
              { label: brand.name, href: ROUTES.EQUIPMENT_BRAND(brand.slug || brand.id) },
              { label: type.name, href: ROUTES.EQUIPMENT_TYPE(brand.slug || brand.id, type.slug || type.id) },
              { label: model.name },
            ]}
          />
          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-semibold">{model.name}</h1>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          <div className="space-y-8">
            {/* Image */}
            <div className="border border-border bg-card shadow-sm p-4">
              {primaryImage ? (
                <img src={primaryImage} alt={model.name} className="w-full max-h-[320px] object-contain" />
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground">
                  No image yet
                </div>
              )}
            </div>

            {/* Info */}
            <div className="border border-border bg-card shadow-sm p-6 space-y-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Model numbers</p>
                <p className="text-sm">{model.model_numbers?.join(", ") || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Protocols</p>
                <p className="text-sm">{model.protocols?.length ? model.protocols.join(", ") : "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Status</p>
                <p className="text-sm capitalize">{model.status || "current"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Manufacturer</p>
                {model.manufacturer_url ? (
                  <a href={model.manufacturer_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Visit manufacturer
                  </a>
                ) : (
                  <p className="text-sm">-</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Description</p>
                <p className="text-sm">{model.description || "-"}</p>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Photos</h2>
                <EquipmentImageUpload
                  equipmentId={model.id}
                  onUploaded={(image) => setImages((prev) => [{ id: image.id, url: image.url }, ...prev])}
                />
              </div>
              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground">No photos yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <img key={img.id} src={img.url} alt="Equipment" className="w-full h-32 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <EquipmentNotes equipmentId={model.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border border-border bg-card shadow-sm p-4">
              <Button
                onClick={toggleExperience}
                disabled={!user}
                className="w-full"
                variant={hasWorked ? "secondary" : "default"}
              >
                {hasWorked ? "Worked with this" : "I've worked with this"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {experienceCount} people have worked with this
              </p>
            </div>

            <div className="border border-border bg-card shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3">People</h2>
              {people.length === 0 ? (
                <p className="text-xs text-muted-foreground">No one yet. Be the first.</p>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {people.map((person) => (
                    <Link
                      key={person.user_id}
                      href={ROUTES.POINTSTACK_PROFILE(person.user?.display_name || "")}
                      className="block"
                    >
                      <UserAvatar name={person.user?.display_name || "Anonymous"} avatarUrl={person.user?.avatar_url} size="sm" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {getBabelIdsForAtlasType(model.type).length > 0 ? (
              <PointStandardsCard atlasTypeId={model.type} />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
