# Shape kit

Canonical visual vocabulary for every illustration in the platform. All
brand-tokenized, animated, theme-aware, free.

Preview gallery: `/dev/shapes`

## Rules

1. **No hex literals in illustrations.** Pull from `COLOR`, `MEDIUM`,
   `EQUIPMENT_VARIANT`. If a new color is needed, add it to `tokens.ts` first.
2. **No inline labels in the SVG.** Wrap every composite in
   `<LabeledSchematic>` and pass labels as data. The wrapper renders them
   in a synchronized HTML strip below the canvas — never overlaps visuals.
3. **One primitive per concept.** If you find yourself drawing a damper
   inline, stop and use `<Damper>`. Same for valves, fans, pipes, etc.
4. **Semantic colors only.** Use `medium="hws"` not `color="red"`. Same
   medium always uses same color across every illustration.

## Files

- `tokens.ts` — colors, sizes, motion durations, semantic palettes
- `equipment-block.tsx` — `<EquipmentBlock>` for AHU / chiller / coil / etc.
- `pipe.tsx` — `<Pipe>` (with arrow chevrons), `<Duct>` (with airflow chevrons)
- `atoms.tsx` — `<SensorDot>`, `<Damper>`, `<Valve>`, `<Fan>`, `<Controller>`, `<Label>`
- `labeled-schematic.tsx` — `<LabeledSchematic>` wrapper, the layout system
- `index.ts` — clean imports

## Colors

| Medium | Supply | Return | Notes |
|---|---|---|---|
| Chilled water | `chwsBlue` (lighter) | `chwrBlue` (darker) | Cooling |
| Hot water | `hwsRed` (lighter) | `hwrRed` (darker) | Heating |
| Condenser water | `cwsGreen` (lighter) | `cwrGreen` (darker) | Tower loop |
| Refrigerant | `refrigerant` (plum) | — | DX / VRF |
| Air | `cream` fill, `ink` stroke | — | Crimson chevrons for flow |
| Control wire | `ink` | — | Always dashed |

## Animation

- **Flow direction**: arrow chevrons travel along path tangent (`offsetRotate: auto`)
- **State transitions**: 350 ms ease (from `MOTION.stateTransitionMs`)
- **Fan spin**: 1.4 s period
- **Air in duct**: crimson chevrons L→R

## How to make a new composite

```tsx
import {
  LabeledSchematic,
  Duct,
  Damper,
  EquipmentBlock,
  Pipe,
  Valve,
  SensorDot,
  Controller,
  COLOR,
} from "@/components/learn/shapes";

export function MyComposite() {
  return (
    <LabeledSchematic
      width={820}
      height={300}
      kicker="MY COMPOSITE TITLE"
      tag="ID-1"
      labels={[
        { x: 130, text: "COMPONENT 1" },
        { x: 430, text: "COMPONENT 2" },
      ]}
      legend={[
        { color: COLOR.chwsBlue, label: "CHW SUPPLY" },
        { color: COLOR.chwrBlue, label: "CHW RETURN" },
        { color: COLOR.ink, label: "CONTROL", dashed: true },
      ]}
    >
      {/* SVG primitives only — NO inline <text> labels */}
      <Duct x={30} y={120} width={760} height={70} flowing />
      <Damper cx={130} cy={155} position={0.65} blades={1} />
      {/* ... */}
    </LabeledSchematic>
  );
}
```

Coords are SVG-viewBox space (`width` × `height` you set on the wrapper).
Labels in the `labels` array align to those same x coords automatically.
