// Maps Atlas catalog type IDs → Babel equipment IDs.
// Keys must match actual type IDs in the Atlas DB types table.
const ATLAS_TO_BABEL_MAP: Record<string, string[]> = {
  "unitary-controllers": [
    "air-handling-unit",
    "rooftop-unit",
    "makeup-air-unit",
    "dedicated-outdoor-air-system",
    "computer-room-air-conditioner",
    "computer-room-air-handler",
    "energy-recovery-ventilator",
    "heat-recovery-ventilator",
  ],
  "vav-controllers": [
    "variable-air-volume-box",
    "constant-air-volume-box",
    "parallel-fan-powered-box",
    "series-fan-powered-box",
  ],
  "zone-controllers": [
    "fan-coil-unit",
    "unit-ventilator",
    "chilled-beam",
    "radiant-panel",
    "baseboard-heater",
  ],
  thermostats: [
    "packaged-terminal-air-conditioner",
    "packaged-terminal-heat-pump",
    "water-source-heat-pump",
    "ductless-mini-split",
    "air-source-heat-pump",
  ],
  "vfds-drives": ["variable-frequency-drive", "pump", "cooling-tower", "exhaust-fan"],
  meters: ["electric-meter", "natural-gas-meter", "water-meter", "steam-meter", "btu-meter"],
  "supervisory-controllers": ["chiller", "boiler"],
  "occupancy-sensors": ["vrf-indoor-unit", "vrf-outdoor-unit", "vrf-branch-selector-box"],
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
