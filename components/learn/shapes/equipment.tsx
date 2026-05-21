"use client";

import { EquipmentBlock } from "./equipment-block";

interface BoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  active?: boolean;
  /** Override the default title (e.g. "HC-2"). */
  title?: string;
  /** Override the default sub-label (e.g. "STAGED"). */
  sub?: string;
}

/**
 * Named equipment wrappers.
 *
 * Each wrapper is a single source of truth for one piece of equipment.
 * Change the wrapper, change every illustration that uses it.
 *
 * Use these instead of `<EquipmentBlock variant="...">` directly so that
 * style tweaks (e.g. swapping kicker text, changing variant) propagate.
 */

export function CoolingCoil(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="cooling"
      kicker={props.sub ? undefined : "COIL"}
      title={props.title ?? "CC"}
    />
  );
}

export function HeatingCoil(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="heating"
      kicker={props.sub ? undefined : "COIL"}
      title={props.title ?? "HC"}
    />
  );
}

export function ReheatCoil(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="heating"
      kicker="REHEAT"
      title={props.title ?? "HW COIL"}
    />
  );
}

export function Filter(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="neutral"
      kicker="FILTER"
      title={props.title ?? "MERV"}
    />
  );
}

export function Chiller(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="cooling"
      kicker="CHILLER"
      title={props.title ?? "CH-1"}
    />
  );
}

export function Boiler(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="heating"
      kicker="BOILER"
      title={props.title ?? "B-1"}
    />
  );
}

export function CoolingTower(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="neutral"
      kicker="COOLING TOWER"
      title={props.title ?? "CT-1"}
    />
  );
}

export function BuildingLoad(props: BoxProps) {
  return (
    <EquipmentBlock
      {...props}
      variant="neutral"
      kicker="LOAD"
      title={props.title ?? "BLDG"}
    />
  );
}
