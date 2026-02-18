import { NextRequest, NextResponse } from "next/server";
import {
  getBasResources,
  getNotModifiedResponseHeaders,
  isEtagMatch,
} from "@/lib/api/bas-resource";
import { applyRateLimit } from "@/lib/api/rate-limit";

function resolveEquipmentTypeId(input: string, resources: Awaited<ReturnType<typeof getBasResources>>) {
  const compact = input.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const equipment of resources.babel.equipment) {
    const candidates = [
      equipment.id,
      equipment.name,
      equipment.abbreviation || "",
      ...(equipment.aliases.common || []),
    ];

    if (candidates.some((candidate) => candidate.toLowerCase().replace(/[^a-z0-9]/g, "") === compact)) {
      return equipment.id;
    }
  }

  return input;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentTypeId: string }> },
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { equipmentTypeId } = await params;
  const resources = await getBasResources();

  if (isEtagMatch(request.headers.get("if-none-match"), resources.etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: getNotModifiedResponseHeaders(resources.etag),
    });
  }

  const resolvedEquipmentTypeId = resolveEquipmentTypeId(equipmentTypeId, resources);
  const templates = resources.templates.templates.filter(
    (template) => template.equipmentTypeId === resolvedEquipmentTypeId,
  );

  if (templates.length === 0) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(
    { equipmentTypeId: resolvedEquipmentTypeId, templates },
    { headers: getNotModifiedResponseHeaders(resources.etag) },
  );
}
