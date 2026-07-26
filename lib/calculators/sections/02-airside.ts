import type { CalcSection } from "../types";
import { hasInvalidNumbers, getMoistAirEnthalpy } from "../psychrometrics";

export const section02: CalcSection = {
  num: "02",
  title: "Airside calculations",
  calculators: [
    {
      id: "air-changes-per-hour-calculator",
      title: "Air Changes per Hour",
      inputs: [
        { key: "cfm", kind: "number", label: "Airflow", unit: "CFM", default: "500" },
        { key: "length", kind: "number", label: "Length", unit: "ft", default: "20" },
        { key: "width", kind: "number", label: "Width", unit: "ft", default: "15" },
        { key: "height", kind: "number", label: "Height", unit: "ft", default: "10" },
      ],
      compute: (v) => {
        const cfm = parseFloat(v.cfm);
        const l = parseFloat(v.length);
        const w = parseFloat(v.width);
        const h = parseFloat(v.height);
        if (hasInvalidNumbers([cfm, l, w, h]) || l <= 0 || w <= 0 || h <= 0) {
          return [{ label: "Air Changes/Hour", value: "—", unit: "ACH" }];
        }
        const volume = l * w * h;
        const ach = (cfm * 60) / volume;
        return [{ label: "Air Changes/Hour", value: ach.toFixed(2), unit: "ACH" }];
      },
    },
    {
      id: "mixed-air-temperature-calculator",
      title: "Mixed Air Temperature",
      note: "Uses actual outdoor-air fraction, not damper blade position.",
      inputs: [
        { key: "oaTemp", kind: "number", label: "Outside Air Temp", unit: "°F", default: "35" },
        { key: "raTemp", kind: "number", label: "Return Air Temp", unit: "°F", default: "72" },
        { key: "oaFraction", kind: "number", label: "OA Air Fraction", unit: "%", default: "30" },
      ],
      compute: (v) => {
        const oa = parseFloat(v.oaTemp);
        const ra = parseFloat(v.raTemp);
        const oaFraction = parseFloat(v.oaFraction);
        if (hasInvalidNumbers([oa, ra, oaFraction])) {
          return [{ label: "Mixed Air Temp", value: "—", unit: "°F" }];
        }
        const boundedFraction = Math.max(0, Math.min(100, oaFraction)) / 100;
        const mat = oa * boundedFraction + ra * (1 - boundedFraction);
        return [{ label: "Mixed Air Temp", value: mat.toFixed(1), unit: "°F" }];
      },
    },
    {
      id: "economizer-enthalpy-calculator",
      title: "Economizer Enthalpy",
      note: "Sea-level moist-air estimate. Compare OA and RA at the same pressure basis.",
      inputs: [
        { key: "temp", kind: "number", label: "Dry Bulb Temp", unit: "°F", default: "70" },
        { key: "rh", kind: "number", label: "Relative Humidity", unit: "%", default: "50" },
      ],
      compute: (v) => {
        const t = parseFloat(v.temp);
        const rh = parseFloat(v.rh);
        if (hasInvalidNumbers([t, rh])) {
          return [{ label: "Enthalpy", value: "—", unit: "BTU/lb" }];
        }
        const h = getMoistAirEnthalpy(t, rh);
        if (!Number.isFinite(h)) {
          return [{ label: "Enthalpy", value: "—", unit: "BTU/lb" }];
        }
        return [{ label: "Enthalpy", value: h.toFixed(2), unit: "BTU/lb" }];
      },
    },
    {
      id: "optimal-start-time-calculator",
      title: "Optimal Start Time",
      note: "Rule-of-thumb setup value. Real optimal start should learn from recovery history.",
      inputs: [
        { key: "deltaT", kind: "number", label: "Temperature Delta", unit: "°F", default: "10" },
        {
          key: "mass",
          kind: "select",
          label: "Building Thermal Mass",
          default: "medium",
          options: [
            { value: "light", label: "Light (modular, open)" },
            { value: "medium", label: "Medium (typical office)" },
            { value: "heavy", label: "Heavy (masonry, concrete)" },
          ],
        },
      ],
      compute: (v) => {
        const dt = parseFloat(v.deltaT);
        if (Number.isNaN(dt)) {
          return [{ label: "Start Before Occupancy", value: "—" }];
        }
        const factors: Record<string, number> = { light: 3, medium: 5, heavy: 8 };
        const time = dt * factors[v.mass];
        return [{ label: "Start Before Occupancy", value: `${time} minutes` }];
      },
    },
  ],
};
