const ATLAS_TO_BABEL_MAP: Record<string, string[]> = {
  ahus: ["air-handling-unit"],
  rtus: ["rooftop-unit"],
  fcus: ["fan-coil-unit"],
  "vav-boxes": ["variable-air-volume-box"],
  chillers: ["chiller"],
  boilers: ["boiler"],
  pumps: ["pump"],
  "cooling-towers": ["cooling-tower"],
  "heat-pumps": ["air-source-heat-pump", "water-source-heat-pump", "packaged-terminal-heat-pump"],
  "vfds-drives": ["variable-frequency-drive"],
  meters: ["electric-meter", "natural-gas-meter", "water-meter", "steam-meter", "btu-meter"],
  "crac-units": ["computer-room-air-conditioner", "computer-room-air-handler"],
  "erv-hrv": ["energy-recovery-ventilator", "heat-recovery-ventilator"],
  "vrf-systems": ["vrf-outdoor-unit", "vrf-indoor-unit", "vrf-branch-selector-box"],
  // Intentionally omitted for now: exhaust-fans, split-systems, humidifiers
  // because BAS Babel does not currently expose matching equipment IDs.
};

const MAPPED_BABEL_IDS = new Set(Object.values(ATLAS_TO_BABEL_MAP).flat());

const BABEL_TO_ATLAS_MAP: Record<string, string> = Object.entries(ATLAS_TO_BABEL_MAP).reduce(
  (acc, [atlasTypeId, babelEquipmentIds]) => {
    for (const babelEquipmentId of babelEquipmentIds) {
      if (!acc[babelEquipmentId]) {
        acc[babelEquipmentId] = atlasTypeId;
      }
    }
    return acc;
  },
  {} as Record<string, string>
);

export function getBabelIdsForAtlasType(atlasTypeId: string): string[] {
  return ATLAS_TO_BABEL_MAP[atlasTypeId] ?? [];
}

export function getAtlasTypeIdForBabelEquipment(babelEquipmentId: string): string | null {
  return BABEL_TO_ATLAS_MAP[babelEquipmentId] ?? null;
}

export function getUnmappedAtlasTypeIds(atlasTypeIds: string[]): string[] {
  return atlasTypeIds.filter((atlasTypeId) => getBabelIdsForAtlasType(atlasTypeId).length === 0).sort();
}

export function getUnmappedBabelEquipmentIds(babelEquipmentIds: string[]): string[] {
  return babelEquipmentIds.filter((babelEquipmentId) => !MAPPED_BABEL_IDS.has(babelEquipmentId)).sort();
}
