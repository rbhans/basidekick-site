"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
  ArrowLeft,
  Tag,
  Copy,
  Check,
  GithubLogo,
  PencilSimple,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { BabelPointEntry, BabelEquipmentEntry } from "@/lib/types";

interface BabelEntryDetailProps {
  entry: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
}

export function BabelEntryDetail({ entry, type }: BabelEntryDetailProps) {
  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);

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
  const notes = isPoint ? pointEntry.notes : undefined;
  const related = isPoint ? pointEntry.related : undefined;

  // Equipment-specific fields
  const fullName = !isPoint ? equipEntry.full_name : undefined;
  const subtypes = !isPoint ? equipEntry.subtypes : undefined;
  const typicalPoints = !isPoint ? equipEntry.typical_points : undefined;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAlias(text);
    setTimeout(() => setCopiedAlias(null), 2000);
  };

  // Construct GitHub edit URL
  const githubEditUrl = isPoint
    ? `https://github.com/rbhans/bas-babel/edit/main/data/points/${category}/${id}.yaml`
    : `https://github.com/rbhans/bas-babel/edit/main/data/equipment/${category}.yaml`;

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
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-card border border-border rounded mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Haystack</p>
          <p className={`font-mono text-sm mt-1 ${haystack && haystack !== "-" ? "" : "text-muted-foreground/50"}`}>
            {haystack || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Brick</p>
          <p className={`font-mono text-sm mt-1 ${brick && brick !== "-" ? "" : "text-muted-foreground/50"}`}>
            {brick || "-"}
          </p>
        </div>
        {unit && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Unit</p>
            <p className="font-mono text-sm mt-1">{unit}</p>
          </div>
        )}
        {typicalRange && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Typical Range</p>
            <p className="font-mono text-sm mt-1">
              {typicalRange.min} - {typicalRange.max}
            </p>
          </div>
        )}
        {objectType && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Object Type</p>
            <p className="font-mono text-sm mt-1">{objectType}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
          <p className="text-sm mt-1 capitalize">{category.replace("-", " ")}</p>
        </div>
      </div>

      {/* Aliases */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">Aliases</h2>

        {aliases.common.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Common</p>
            <div className="flex flex-wrap gap-2">
              {aliases.common.map((alias, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(alias)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/50 hover:bg-muted rounded font-mono transition-colors group"
                >
                  <Tag className="size-3.5 opacity-50" />
                  {alias}
                  {copiedAlias === alias ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {aliases.misspellings && aliases.misspellings.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Common Misspellings</p>
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
          </div>
        )}
      </div>

      {/* Subtypes (equipment only) */}
      {subtypes && subtypes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Subtypes</h2>
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
        </div>
      )}

      {/* Notes */}
      {notes && notes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Notes</h2>
          <ul className="space-y-2">
            {notes.map((note, index) => (
              <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related entries */}
      {related && related.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Related</h2>
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
        </div>
      )}

      {/* Typical points (equipment only) */}
      {typicalPoints && typicalPoints.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Typical Points</h2>
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
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-border">
        <Button variant="outline" asChild>
          <a href={githubEditUrl} target="_blank" rel="noopener noreferrer">
            <PencilSimple className="size-4 mr-2" />
            Suggest Edit
            <ArrowSquareOut className="size-3 ml-2 opacity-50" />
          </a>
        </Button>
        <Button variant="ghost" asChild>
          <a
            href="https://github.com/rbhans/bas-babel/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubLogo className="size-4 mr-2" />
            Report Issue
          </a>
        </Button>
      </div>
    </div>
  );
}
