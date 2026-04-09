"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
  ArrowLeft,
  Tag,
  Copy,
  Bug,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { BabelPointEntry, BabelEquipmentEntry, BabelContributionType } from "@/lib/types";
import { BabelContributionDialog } from "./babel-contribution-dialog";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { getAtlasTypeIdForBabelEquipment } from "@/lib/data/atlas-babel-map";
import { inferBabelPointKind } from "@/lib/data/babel-kind";

interface BabelEntryDetailProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
  isAuthenticated?: boolean;
  hideBackLink?: boolean;
}

function EmptyState({ text = "-" }: { text?: string }) {
  return <span className="text-muted-foreground/50">{text}</span>;
}

function AtlasEquipmentSection({ atlasTypeId }: { atlasTypeId: string }) {
  const { data: atlasData, loading, error } = useAtlasData();

  const { atlasTypeExists, modelsByBrand } = useMemo(() => {
    if (!atlasData) return { atlasTypeExists: true, modelsByBrand: [] };

    const atlasType = atlasData.types.find((type) => type.id === atlasTypeId);
    if (!atlasType) return { atlasTypeExists: false, modelsByBrand: [] };

    const brandById = new Map(atlasData.brands.map((brand) => [brand.id, brand] as const));
    const grouped = new Map<
      string,
      {
        brandName: string;
        brandSlug: string;
        models: typeof atlasData.models;
        typeSlug: string;
      }
    >();

    for (const model of atlasData.models) {
      if (model.type !== atlasTypeId) continue;
      const brand = brandById.get(model.brand);
      if (!brand) continue;

      const existing = grouped.get(brand.id);
      if (existing) {
        existing.models.push(model);
        continue;
      }

      grouped.set(brand.id, {
        brandName: brand.name,
        brandSlug: brand.slug || brand.id,
        models: [model],
        typeSlug: atlasType.slug || atlasType.id,
      });
    }

    const sortedGroups = Array.from(grouped.values())
      .map((group) => ({
        ...group,
        models: [...group.models].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.brandName.localeCompare(b.brandName));

    return { atlasTypeExists: true, modelsByBrand: sortedGroups };
  }, [atlasData, atlasTypeId]);

  if (loading) {
    return (
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">·</span>Equipment in Atlas</div>
        <p className="text-sm text-muted-foreground">Loading Atlas equipment models...</p>
      </div>
    );
  }

  if (error || !atlasData) return null;

  if (!atlasTypeExists) {
    return (
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">·</span>Equipment in Atlas</div>
        <p className="text-sm text-destructive">
          Broken mapping: this BAS Atlas term references an Atlas type that no longer exists.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">·</span>Equipment in Atlas</div>
      {modelsByBrand.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No models tracked yet.{" "}
          <Link href={ROUTES.ATLAS_EQUIPMENT_ADD} className="text-primary hover:underline">
            Add one in BAS Atlas
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-4">
          {modelsByBrand.map((group) => (
            <div key={group.brandSlug} className="p-3 bg-card border border-border rounded">
              <p className="text-sm font-semibold mb-2">{group.brandName}</p>
              <ul className="space-y-1">
                {group.models.map((model) => (
                  <li key={model.id}>
                    <Link
                      href={ROUTES.ATLAS_EQUIPMENT_MODEL(group.brandSlug, group.typeSlug, model.slug || model.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      {model.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BabelEntryDetail({ entry, type, isAuthenticated = false, hideBackLink = false }: BabelEntryDetailProps) {
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [contributionType, setContributionType] = useState<BabelContributionType>("edit");

  const isPoint = type === "point";
  const pointEntry = entry as BabelPointEntry;
  const equipEntry = entry as BabelEquipmentEntry;

  const id = isPoint ? pointEntry.concept.id : equipEntry.id;
  const name = isPoint ? pointEntry.concept.name : equipEntry.name;
  const description = isPoint ? pointEntry.concept.description : equipEntry.description;
  const category = isPoint ? pointEntry.concept.category : equipEntry.category;
  const aliases = isPoint ? pointEntry.aliases : equipEntry.aliases;

  // Shared fields
  const haystack = isPoint ? pointEntry.concept.haystack : equipEntry.haystack;
  const brick = isPoint ? pointEntry.concept.brick : equipEntry.brick;

  // Point-specific fields
  const unit = isPoint ? pointEntry.concept.unit : undefined;
  const typicalRange = isPoint ? pointEntry.concept.typical_range : undefined;
  const objectType = isPoint ? pointEntry.concept.object_type : undefined;
  const states = isPoint ? pointEntry.concept.states : undefined;
  const notes = isPoint ? pointEntry.notes : undefined;
  const related = isPoint ? pointEntry.related : undefined;
  const inferredPointKind = isPoint ? inferBabelPointKind(pointEntry.concept) : null;

  // Equipment-specific fields
  const fullName = !isPoint ? equipEntry.full_name : undefined;
  const subtypes = !isPoint ? equipEntry.subtypes : undefined;
  const typicalPoints = !isPoint ? equipEntry.typical_points : undefined;
  const atlasTypeId = !isPoint ? getAtlasTypeIdForBabelEquipment(equipEntry.id) : null;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Alias copied");
  };

  const openContributionDialog = (dialogType: BabelContributionType) => {
    setContributionType(dialogType);
    setContributionDialogOpen(true);
  };

  return (
    <div className="max-w-[820px] mx-auto">
      {/* Back link */}
      {!hideBackLink && (
        <Link
          href={ROUTES.ATLAS}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 mb-6"
        >
          <ArrowLeft className="w-3 h-3 text-accent" />
          Back to Atlas
        </Link>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-2">
          <span className="text-accent mr-1">{type}</span>
          <span className="text-muted-foreground/40 mx-1.5">·</span>
          <span>{category.replace("-", " ")}</span>
        </div>
        <h1 className="font-heading font-semibold text-[30px] md:text-[36px] leading-[1.1] tracking-[-0.015em] text-foreground">
          {name}
        </h1>
        {fullName && fullName !== name && (
          <p className="font-heading italic text-[17px] text-muted-foreground mt-1.5">
            {fullName}
          </p>
        )}
        {description ? (
          <p className="text-[15px] text-foreground leading-[1.6] mt-4 max-w-[680px]">
            {description}
          </p>
        ) : (
          <p className="font-heading italic text-[14px] text-muted-foreground mt-4">
            No description yet.
          </p>
        )}
      </div>

      {/* Metadata — specimen style */}
      <div className="border-t border-b border-foreground mb-8">
        <div className="grid grid-cols-[140px_1fr] gap-4 py-2.5 border-b border-muted">
          <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground pt-0.5">Brick</div>
          <div className="font-mono text-[12px] text-foreground leading-[1.5] break-words">
            {brick || <span className="text-muted-foreground/40">—</span>}
          </div>
        </div>
        <div className="grid grid-cols-[140px_1fr] gap-4 py-2.5 border-b border-muted">
          <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground pt-0.5">Category</div>
          <div className="font-mono text-[12px] text-foreground leading-[1.5] capitalize">
            {category.replace("-", " ")}
          </div>
        </div>
        {isPoint && (
          <>
            <div className="grid grid-cols-[140px_1fr] gap-4 py-2.5 border-b border-muted">
              <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground pt-0.5">Typical range</div>
              <div className="font-mono text-[12px] text-foreground leading-[1.5] tabular-nums">
                {typicalRange ? `${typicalRange.min} – ${typicalRange.max}` : <span className="text-muted-foreground/40">—</span>}
              </div>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground pt-0.5">Object type</div>
              <div className="font-mono text-[12px] text-foreground leading-[1.5]">
                {objectType || <span className="text-muted-foreground/40">—</span>}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Haystack */}
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground">
          <span className="text-accent mr-1.5">01 /</span>
          Haystack
        </div>
        <div className="space-y-4">
          {haystack ? (
            <>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {haystack.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center gap-1 px-2 py-1 font-mono text-[11px] bg-muted text-foreground border border-border rounded-sm"
                    >
                      {tag.name}
                      <span className="text-[9px] text-muted-foreground">{tag.kind}</span>
                    </span>
                  ))}
                </div>
              </div>

              {isPoint && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">Kind</p>
                      <p className="font-mono text-sm mt-1">{pointEntry.concept.haystack?.kind ?? inferredPointKind}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">Point Function</p>
                      <p className={`font-mono text-sm mt-1 ${pointEntry.concept.point_function ? "" : "text-muted-foreground/50"}`}>
                        {pointEntry.concept.point_function || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">Haystack Unit</p>
                      <p className={`font-mono text-sm mt-1 ${pointEntry.concept.haystack?.unit ? "" : "text-muted-foreground/50"}`}>
                        {pointEntry.concept.haystack?.unit || "-"}
                      </p>
                    </div>
                  </div>

                  {unit && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">Source Units</p>
                      <p className="font-mono text-sm mt-1">
                        {Array.isArray(unit) ? unit.join(" / ") : unit}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">States</p>
                    {states && Object.keys(states).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(states).map(([value, labels]) => {
                          const labelArray = Array.isArray(labels) ? labels : [labels];
                          return (
                            <div key={value} className="p-2 bg-muted/30 rounded">
                              <div className="flex items-baseline gap-2">
                                <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{value}</span>
                                <span className="text-sm">{labelArray.join(", ")}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/50">-</p>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground/50">No Haystack data</p>
          )}
        </div>
      </div>

      {/* Aliases */}
      <div className="space-y-4 mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">02 /</span>Aliases</div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Common</p>
          {aliases.common && aliases.common.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {aliases.common.map((alias, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(alias)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded font-mono transition-colors group"
                >
                  <Tag className="size-3.5 opacity-50" />
                  {alias}
                  <Copy className="size-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">-</p>
          )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Common Misspellings</p>
          {aliases.misspellings && aliases.misspellings.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {aliases.misspellings.map((alias, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-muted/30 rounded font-mono text-muted-foreground"
                >
                  {alias}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">-</p>
          )}
        </div>
      </div>

      {/* Subtypes (equipment only) */}
      {!isPoint && (
        <div className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">03 /</span>Subtypes</div>
          {subtypes && subtypes.length > 0 ? (
            <div className="space-y-3">
              {subtypes.map((subtype) => (
                <div key={subtype.id} className="p-3 bg-card border border-border rounded">
                  <p className="font-medium">{subtype.name}</p>
                  {subtype.description && (
                    <p className="text-sm text-muted-foreground mt-1">{subtype.description}</p>
                  )}
                  {subtype.aliases && subtype.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {subtype.aliases.map((alias, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-0.5 bg-muted/50 rounded font-mono"
                        >
                          {alias}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">-</p>
          )}
        </div>
      )}

      {/* Notes (points only) */}
      {isPoint && (
        <div className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">03 /</span>Notes</div>
          {notes && notes.length > 0 ? (
            <ul className="space-y-2">
              {notes.map((note, index) => (
                <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground/50">-</p>
          )}
        </div>
      )}

      {/* Related entries (points only) */}
      {isPoint && (
        <div className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">04 /</span>Related points</div>
          {related && related.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {related.map((relatedId) => (
                <Link
                  key={relatedId}
                  href={ROUTES.ATLAS_ENTRY(relatedId)}
                  className="text-sm px-3 py-1.5 bg-secondary text-primary hover:bg-secondary rounded transition-colors"
                >
                  {relatedId}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">-</p>
          )}
        </div>
      )}

      {/* Typical points (equipment only) */}
      {!isPoint && (
        <div className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-muted-foreground mb-4 pb-2.5 border-b border-foreground"><span className="text-accent mr-1.5">04 /</span>Typical points</div>
          {typicalPoints && typicalPoints.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {typicalPoints.map((pointId) => (
                <Link
                  key={pointId}
                  href={ROUTES.ATLAS_ENTRY(pointId)}
                  className="text-sm px-3 py-1.5 bg-muted/50 hover:bg-muted rounded font-mono transition-colors"
                >
                  {pointId}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">-</p>
          )}
        </div>
      )}

      {!isPoint && atlasTypeId && <AtlasEquipmentSection atlasTypeId={atlasTypeId} />}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-border">
        <Button variant="outline" onClick={() => openContributionDialog("edit")}>
          <PencilSimple className="size-4 mr-2" />
          Suggest Edit
        </Button>
        <Button variant="ghost" onClick={() => openContributionDialog("error")}>
          <Bug className="size-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Contribution Dialog */}
      <BabelContributionDialog
        open={contributionDialogOpen}
        onOpenChange={setContributionDialogOpen}
        initialType={contributionType}
        entryId={id}
        entryType={type}
        entryCategory={category}
        entryName={name}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
