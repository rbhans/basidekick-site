/**
 * Shape kit — single visual vocabulary for every illustration.
 *
 * Import primitives from here. The kit is brand-tokenized (see `./tokens.ts`)
 * so every illustration stays consistent.
 *
 *   import { EquipmentBlock, Pipe, Duct, SensorDot, Damper, Valve, Fan,
 *            Controller, Label, COLOR, MEDIUM } from "@/components/learn/shapes";
 */
export { EquipmentBlock } from "./equipment-block";
export {
  CoolingCoil,
  HeatingCoil,
  ReheatCoil,
  Filter,
  Chiller,
  Boiler,
  CoolingTower,
  BuildingLoad,
} from "./equipment";
export { Pipe, Duct } from "./pipe";
export { SensorDot, Damper, Valve, Fan, Pump, Controller, Label } from "./atoms";
export { LabeledSchematic } from "./labeled-schematic";
export {
  Schematic,
  PRIMITIVE_ANCHORS,
  centered,
  spanned,
  inset,
  fitRadius,
} from "./schematic";
export type {
  BBox,
  LaneDef,
  SlotDef,
  ConnectDef,
  LabelDef,
  LegendItem as SchematicLegendItem,
} from "./schematic";
export { routePipe } from "./pipe-router";
export type { AnchorPoint, AnchorDirection } from "./pipe-router";
export {
  STANDARD_ANCHORS,
  type AnchorTable,
  type AnchorName,
  type AnchorOffset,
} from "./anchors";
export {
  COLOR,
  COLOR_RAW,
  MEDIUM,
  EQUIPMENT_VARIANT,
  STROKE,
  RADIUS,
  FONT,
  MOTION,
} from "./tokens";
export type { Medium, EquipmentVariant } from "./tokens";
