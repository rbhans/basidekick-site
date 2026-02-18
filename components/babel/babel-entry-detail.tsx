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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  BabelPointEntry,
  BabelEquipmentEntry,
  BabelEquipmentEntryEnhanced,
  BabelTemplate,
  BabelContributionType,
} from "@/lib/types";
import { BabelContributionDialog } from "./babel-contribution-dialog";
import { useAtlasData } from "@/components/atlas/use-atlas-data";
import { getAtlasTypeIdForBabelEquipment } from "@/lib/data/atlas-babel-map";

interface BabelEntryDetailProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
  isAuthenticated?: boolean;
}

type PointGraphResponse = {
  graph?: {
    related: string[];
    traversal: string[];
  };
};

type TemplateResponse = {
  equipmentTypeId: string;
  templates: BabelTemplate[];
};

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
        <h2 className="text-lg font-semibold mb-3">Equipment in BAS Atlas</h2>
        <p className="text-sm text-muted-foreground">Loading Atlas equipment models...</p>
      </div>
    );
  }

  if (error || !atlasData) return null;

  if (!atlasTypeExists) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Equipment in BAS Atlas</h2>
        <p className="text-sm text-destructive">
          Broken mapping: this BAS Babel entry references an Atlas type that no longer exists.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Equipment in BAS Atlas</h2>
      {modelsByBrand.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No models tracked yet.{" "}
          <Link href={ROUTES.EQUIPMENT_ADD} className="text-primary hover:underline">
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
                      href={ROUTES.EQUIPMENT_MODEL(group.brandSlug, group.typeSlug, model.slug || model.id)}
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

export function BabelEntryDetail({ entry, type, isAuthenticated = false }: BabelEntryDetailProps) {
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [contributionType, setContributionType] = useState<BabelContributionType>("edit");
  const [pointGraph, setPointGraph] = useState<PointGraphResponse["graph"] | null>(null);
  const [pointGraphError, setPointGraphError] = useState<string | null>(null);
  const [templateResponse, setTemplateResponse] = useState<TemplateResponse | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const isPoint = type === "point";
  const pointEntry = entry as BabelPointEntry;
  const equipEntry = entry as BabelEquipmentEntryEnhanced;

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
  const statesNormalized = isPoint ? pointEntry.concept.statesNormalized : undefined;
  const unitsNormalized = isPoint ? pointEntry.concept.unitsNormalized : undefined;
  const pointConceptType = isPoint ? pointEntry.concept.type : undefined;
  const notes = isPoint ? pointEntry.notes : undefined;
  const related = isPoint ? pointEntry.related : undefined;
  const pointTags = isPoint ? pointEntry.concept.tags?.haystack : undefined;

  // Equipment-specific fields
  const fullName = !isPoint ? equipEntry.full_name : undefined;
  const subtypes = !isPoint ? equipEntry.subtypes : undefined;
  const typicalPoints = !isPoint ? equipEntry.typical_points : undefined;
  const equipmentSystem = !isPoint ? equipEntry.concept?.system : undefined;
  const equipmentSynonyms = !isPoint ? equipEntry.concept?.synonyms : undefined;
  const atlasTypeId = !isPoint ? getAtlasTypeIdForBabelEquipment(equipEntry.id) : null;

  const aliasVariants = aliases.variants ?? [];
  const groupedAliasVariants = useMemo(() => {
    return {
      alias: aliasVariants.filter((variant) => variant.type === "alias"),
      misspelling: aliasVariants.filter((variant) => variant.type === "misspelling"),
    };
  }, [aliasVariants]);

  useEffect(() => {
    if (!isPoint) return;
    const controller = new AbortController();

    async function fetchPointGraph() {
      try {
        const response = await fetch(`/api/points/${encodeURIComponent(id)}?includeGraph=true&depth=2`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to load point graph (${response.status})`);
        }
        const payload = (await response.json()) as PointGraphResponse;
        if (!controller.signal.aborted) {
          setPointGraph(payload.graph ?? null);
          setPointGraphError(null);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setPointGraphError(error instanceof Error ? error.message : "Failed to load point graph");
      }
    }

    fetchPointGraph();
    return () => controller.abort();
  }, [id, isPoint]);

  useEffect(() => {
    if (isPoint) return;
    const controller = new AbortController();

    async function fetchTemplates() {
      try {
        const response = await fetch(`/api/templates/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          if (!controller.signal.aborted) {
            setTemplateResponse({ equipmentTypeId: id, templates: [] });
            setTemplateError(null);
          }
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to load templates (${response.status})`);
        }
        const payload = (await response.json()) as TemplateResponse;
        if (!controller.signal.aborted) {
          setTemplateResponse(payload);
          setTemplateError(null);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setTemplateError(error instanceof Error ? error.message : "Failed to load templates");
      }
    }

    fetchTemplates();
    return () => controller.abort();
  }, [id, isPoint]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Alias copied");
  };

  const openContributionDialog = (dialogType: BabelContributionType) => {
    setContributionType(dialogType);
    setContributionDialogOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href={ROUTES.BABEL}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to BAS Babel
      </Link>

      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-medium uppercase tracking-wider text-primary/70">
          {type}
        </span>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
          {name}
        </h1>
        {fullName && fullName !== name && (
          <p className="text-lg text-muted-foreground mt-1">{fullName}</p>
        )}
        <p className="text-muted-foreground mt-2">{description || <EmptyState text="No description" />}</p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-card border border-border rounded mb-6">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Haystack</p>
          <p className={`font-mono text-sm mt-1 break-words ${haystack ? "" : "text-muted-foreground/50"}`}>
            {haystack || "-"}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Brick</p>
          <p className={`font-mono text-sm mt-1 break-words ${brick ? "" : "text-muted-foreground/50"}`}>
            {brick || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
          <p className="text-sm mt-1 capitalize">{category.replace("-", " ")}</p>
        </div>

        {/* Point-specific metadata */}
        {isPoint && (
          <>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Concept Type</p>
              <p className={`text-sm mt-1 capitalize ${pointConceptType ? "" : "text-muted-foreground/50"}`}>
                {pointConceptType || "-"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Unit</p>
              <p className={`font-mono text-sm mt-1 ${unit ? "" : "text-muted-foreground/50"}`}>
                {unit ? (Array.isArray(unit) ? unit.join(" / ") : unit) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Typical Range</p>
              <p className={`font-mono text-sm mt-1 ${typicalRange ? "" : "text-muted-foreground/50"}`}>
                {typicalRange ? `${typicalRange.min} - ${typicalRange.max}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Object Type</p>
              <p className={`font-mono text-sm mt-1 ${objectType ? "" : "text-muted-foreground/50"}`}>
                {objectType || "-"}
              </p>
            </div>
          </>
        )}

        {!isPoint && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">System</p>
            <p className={`text-sm mt-1 capitalize ${equipmentSystem ? "" : "text-muted-foreground/50"}`}>
              {equipmentSystem ? equipmentSystem.replace(/-/g, " ") : "-"}
            </p>
          </div>
        )}
      </div>

      {/* States (points only, not for numeric/analog points with units) */}
      {isPoint && !unit && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">States</h2>
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
      )}

      {/* Normalized metadata (points only) */}
      {isPoint && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Normalized Metadata</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Units Normalized</p>
              {unitsNormalized && unitsNormalized.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {unitsNormalized.map((value) => (
                    <span key={value} className="text-xs px-2 py-1 bg-muted/50 rounded font-mono">
                      {value}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50">-</p>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">States Normalized</p>
              {statesNormalized && Object.keys(statesNormalized).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(statesNormalized).map(([value, label]) => (
                    <div key={value} className="p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {value}
                        </span>
                        <span className="text-sm">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50">-</p>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Haystack Tags</p>
              {pointTags && pointTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pointTags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-muted/50 rounded font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50">-</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aliases */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">Aliases</h2>

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

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Alias Variants (v2)</p>
          {groupedAliasVariants.alias.length > 0 || groupedAliasVariants.misspelling.length > 0 ? (
            <div className="space-y-3">
              {groupedAliasVariants.alias.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Alias</p>
                  <div className="flex flex-wrap gap-2">
                    {groupedAliasVariants.alias.slice(0, 80).map((variant) => (
                      <span
                        key={`alias-${variant.value}`}
                        className="inline-flex items-center px-2.5 py-1 text-xs bg-muted/40 rounded font-mono"
                      >
                        {variant.value}
                      </span>
                    ))}
                    {groupedAliasVariants.alias.length > 80 && (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground">
                        +{groupedAliasVariants.alias.length - 80} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {groupedAliasVariants.misspelling.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Misspelling</p>
                  <div className="flex flex-wrap gap-2">
                    {groupedAliasVariants.misspelling.map((variant) => (
                      <span
                        key={`miss-${variant.value}`}
                        className="inline-flex items-center px-2.5 py-1 text-xs bg-muted/30 rounded font-mono text-muted-foreground"
                      >
                        {variant.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">-</p>
          )}
        </div>
      </div>

      {/* Equipment concept metadata */}
      {!isPoint && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Equipment Concept</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">System</p>
              <p className={`text-sm ${equipmentSystem ? "" : "text-muted-foreground/50"}`}>
                {equipmentSystem ? equipmentSystem.replace(/-/g, " ") : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Synonyms</p>
              {equipmentSynonyms && equipmentSynonyms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {equipmentSynonyms.slice(0, 80).map((synonym) => (
                    <span key={synonym} className="text-xs px-2 py-1 bg-muted/50 rounded font-mono">
                      {synonym}
                    </span>
                  ))}
                  {equipmentSynonyms.length > 80 && (
                    <span className="text-xs text-muted-foreground">+{equipmentSynonyms.length - 80} more</span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50">-</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtypes (equipment only) */}
      {!isPoint && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Subtypes</h2>
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
          <h2 className="text-lg font-semibold mb-3">Notes</h2>
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
          <h2 className="text-lg font-semibold mb-3">Related Points</h2>
          {related && related.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {related.map((relatedId) => (
                <Link
                  key={relatedId}
                  href={ROUTES.BABEL_ENTRY(relatedId)}
                  className="text-sm px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
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

      {/* Graph relationships (points only) */}
      {isPoint && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Relationship Graph (v1)</h2>
          {pointGraphError ? (
            <p className="text-sm text-destructive">{pointGraphError}</p>
          ) : !pointGraph ? (
            <p className="text-sm text-muted-foreground/50">Loading graph relationships...</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Direct Related</p>
                {pointGraph.related && pointGraph.related.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {pointGraph.related.map((relatedId) => (
                      <Link
                        key={`direct-${relatedId}`}
                        href={ROUTES.BABEL_ENTRY(relatedId)}
                        className="text-sm px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                      >
                        {relatedId}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Traversal (depth 2)</p>
                {pointGraph.traversal && pointGraph.traversal.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {pointGraph.traversal.map((relatedId) => (
                      <Link
                        key={`trav-${relatedId}`}
                        href={ROUTES.BABEL_ENTRY(relatedId)}
                        className="text-sm px-3 py-1.5 bg-muted/50 hover:bg-muted rounded transition-colors"
                      >
                        {relatedId}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50">-</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Typical points (equipment only) */}
      {!isPoint && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Typical Points</h2>
          {typicalPoints && typicalPoints.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {typicalPoints.map((pointId) => (
                <Link
                  key={pointId}
                  href={ROUTES.BABEL_ENTRY(pointId)}
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

      {/* Template relationships (equipment only) */}
      {!isPoint && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Template Relationships (v1)</h2>
          {templateError ? (
            <p className="text-sm text-destructive">{templateError}</p>
          ) : !templateResponse ? (
            <p className="text-sm text-muted-foreground/50">Loading templates...</p>
          ) : templateResponse.templates.length === 0 ? (
            <p className="text-sm text-muted-foreground/50">No templates mapped yet.</p>
          ) : (
            <div className="space-y-4">
              {templateResponse.templates.map((template) => (
                <div key={template.id} className="p-3 bg-card border border-border rounded space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{template.id}</p>
                    <span className="text-xs text-muted-foreground font-mono">v{template.version}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2 bg-muted/30 rounded">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Required</p>
                      <p className="text-sm">{template.requiredPoints.length}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Optional</p>
                      <p className="text-sm">{template.optionalPoints.length}</p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Recommended</p>
                      <p className="text-sm">{template.recommendedPoints.length}</p>
                    </div>
                  </div>
                  {template.relationships.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Point Relationships</p>
                      <div className="space-y-1">
                        {template.relationships.map((rel, index) => (
                          <p key={`${rel.from}-${rel.rel}-${rel.to}-${index}`} className="text-xs font-mono text-muted-foreground">
                            {rel.from} {rel.rel} {rel.to}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
