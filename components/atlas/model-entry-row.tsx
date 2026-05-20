"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { AtlasModel } from "@/lib/types";

interface ModelEntryRowProps {
  model: AtlasModel;
  showBrand?: boolean;
}

export function ModelEntryRow({ model, showBrand = false }: ModelEntryRowProps) {
  const brandSlug = model.brand_slug ?? model.brand;
  const typeSlug = model.type_slug ?? model.type;
  const href =
    brandSlug && typeSlug && model.slug
      ? ROUTES.ATLAS_EQUIPMENT_MODEL(brandSlug, typeSlug, model.slug)
      : ROUTES.ATLAS_EQUIPMENT_BRAND(brandSlug ?? "");

  const numbers = model.model_numbers ?? [];
  const protocols = model.protocols ?? [];
  const previewNumbers = numbers.slice(0, 4);
  const isDiscontinued = model.status === "discontinued";

  return (
    <Link href={href} className="at-row" data-type="model">
      <div className="lead">
        <span className="nm">
          {showBrand && model.brand_name && (
            <span className="model-brand">{model.brand_name}</span>
          )}
          {model.name}
        </span>
        <span className="meta">
          {model.type_name && (
            <>
              <span className="model-type">{model.type_name}</span>
              <span className="sep">·</span>
            </>
          )}
          <span>
            {numbers.length} {numbers.length === 1 ? "model #" : "model #s"}
          </span>
          {protocols.length > 0 && (
            <>
              <span className="sep">·</span>
              <span>{protocols.join(", ")}</span>
            </>
          )}
          {isDiscontinued && (
            <>
              <span className="sep">·</span>
              <span className="model-discontinued">discontinued</span>
            </>
          )}
        </span>
      </div>
      <div className="aliases">
        {previewNumbers.length > 0 ? (
          previewNumbers.map((num, idx) => (
            <span key={idx}>
              {idx === 0 ? <span className="pp">{num}</span> : num}
              {idx < previewNumbers.length - 1 && <span className="sep">·</span>}
            </span>
          ))
        ) : (
          <span className="text-ink-4">no model numbers</span>
        )}
      </div>
      <div className="right">
        <span className="ct">
          <b>{numbers.length}</b>
          {numbers.length === 1 ? "number" : "numbers"}
        </span>
        {model.type_name && <span className="haystack">{model.type_name}</span>}
        <span className="arr">→</span>
      </div>
    </Link>
  );
}
