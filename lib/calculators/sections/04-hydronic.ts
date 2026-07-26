import type { CalcSection } from "../types";
import { hasInvalidNumbers, STANDARD_ATMOSPHERE_PSI } from "../psychrometrics";

export const section04: CalcSection = {
  num: "04",
  title: "Hydronic systems",
  calculators: [
    {
      id: "pump-head-pressure-calculator",
      title: "Pump Head Pressure",
      note: "Water-only Hazen-Williams estimate for straight pipe. Add fittings, valves, coils, strainers, and glycol correction separately.",
      inputs: [
        { key: "gpm", kind: "number", label: "Flow Rate", unit: "GPM", default: "100" },
        { key: "length", kind: "number", label: "Pipe Run Length", unit: "ft", default: "200" },
        { key: "size", kind: "number", label: "Inside Diameter", unit: "in", default: "2" },
        { key: "cFactor", kind: "number", label: "Hazen-Williams C", default: "140" },
      ],
      compute: (v) => {
        const gpm = parseFloat(v.gpm);
        const length = parseFloat(v.length);
        const size = parseFloat(v.size);
        const cFactor = parseFloat(v.cFactor);
        if (hasInvalidNumbers([gpm, length, size, cFactor]) || size <= 0 || cFactor <= 0) {
          return [{ label: "Friction Loss", value: "—", unit: "ft H₂O" }];
        }
        const frictionLoss = (4.52 * Math.pow(gpm, 1.85) * length) / (Math.pow(cFactor, 1.85) * Math.pow(size, 4.87));
        return [{ label: "Friction Loss", value: frictionLoss.toFixed(1), unit: "ft H₂O" }];
      },
    },
    {
      id: "glycol-effects-calculator",
      title: "Glycol Effects",
      note: "Screening estimate only. Use glycol manufacturer data for freeze point, viscosity, and pump correction.",
      inputs: [{ key: "glycolPercent", kind: "number", label: "Glycol Concentration", unit: "%", default: "30" }],
      compute: (v) => {
        const pct = parseFloat(v.glycolPercent);
        if (Number.isNaN(pct)) {
          return [
            { label: "Heat Transfer Capacity", value: "—" },
            { label: "Required Flow Increase", value: "—" },
          ];
        }
        const boundedPct = Math.max(0, Math.min(60, pct));
        const capacityLoss = boundedPct * 0.5;
        const flowIncrease = boundedPct * 0.3;
        return [
          { label: "Heat Transfer Capacity", value: `${(100 - capacityLoss).toFixed(0)}%` },
          { label: "Required Flow Increase", value: `+${flowIncrease.toFixed(0)}%` },
        ];
      },
    },
    {
      id: "expansion-tank-sizing-calculator",
      title: "Expansion Tank Sizing",
      note: "Water estimate with diaphragm-tank acceptance. Confirm fill pressure, relief setting, and tank manufacturer selection.",
      inputs: [
        { key: "volume", kind: "number", label: "System Volume", unit: "gal", default: "100" },
        { key: "deltaT", kind: "number", label: "Temperature Rise", unit: "°F", default: "40" },
        { key: "fillPressure", kind: "number", label: "Fill Pressure", unit: "psig", default: "12" },
        { key: "maxPressure", kind: "number", label: "Max Pressure", unit: "psig", default: "28" },
      ],
      compute: (v) => {
        const vol = parseFloat(v.volume);
        const dt = parseFloat(v.deltaT);
        const fill = parseFloat(v.fillPressure);
        const max = parseFloat(v.maxPressure);
        if (hasInvalidNumbers([vol, dt, fill, max]) || max <= fill) {
          return [
            { label: "Expanded Volume", value: "—", unit: "gal" },
            { label: "Minimum Tank Size", value: "—", unit: "gal" },
          ];
        }
        const expansion = vol * dt * 0.00023;
        const acceptance = (max - fill) / (max + STANDARD_ATMOSPHERE_PSI);
        const tankSize = acceptance > 0 ? expansion / acceptance : Number.NaN;
        return [
          { label: "Expanded Volume", value: expansion.toFixed(2), unit: "gal" },
          { label: "Minimum Tank Size", value: Number.isFinite(tankSize) ? tankSize.toFixed(1) : "—", unit: "gal" },
        ];
      },
    },
    {
      id: "valve-cv-calculator",
      title: "Valve Cv Calculator",
      note: "Liquid Cv estimate. Check valve authority, closeoff pressure, and manufacturer sizing.",
      inputs: [
        { key: "flow", kind: "number", label: "Flow Rate", unit: "GPM", default: "50" },
        { key: "deltaP", kind: "number", label: "Pressure Drop", unit: "PSI", default: "4" },
        { key: "sg", kind: "number", label: "Specific Gravity", default: "1.0" },
      ],
      compute: (v) => {
        const flow = parseFloat(v.flow);
        const dp = parseFloat(v.deltaP);
        const sg = parseFloat(v.sg);
        if (hasInvalidNumbers([flow, dp, sg]) || dp === 0 || sg <= 0) {
          return [{ label: "Required Cv", value: "—" }];
        }
        const cv = flow / Math.sqrt(dp / sg);
        return [{ label: "Required Cv", value: cv.toFixed(1) }];
      },
    },
    {
      id: "btu-from-flow-calculator",
      title: "BTU from Flow",
      note: "Uses the common water constant 500. Adjust for glycol or unusual fluid properties.",
      inputs: [
        { key: "gpm", kind: "number", label: "Flow Rate", unit: "GPM", default: "50" },
        { key: "deltaT", kind: "number", label: "Temperature Difference", unit: "°F", default: "10" },
      ],
      compute: (v) => {
        const gpm = parseFloat(v.gpm);
        const dt = parseFloat(v.deltaT);
        if (hasInvalidNumbers([gpm, dt])) {
          return [
            { label: "Heat Transfer", value: "—", unit: "BTU/hr" },
            { label: "Cooling Tons", value: "—", unit: "tons" },
          ];
        }
        const btu = gpm * dt * 500;
        const tons = btu / 12000;
        return [
          { label: "Heat Transfer", value: btu.toLocaleString(), unit: "BTU/hr" },
          { label: "Cooling Tons", value: tons.toFixed(2), unit: "tons" },
        ];
      },
    },
  ],
};
