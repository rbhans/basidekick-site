import type { CalcSection } from "../types";
import { hasInvalidNumbers } from "../psychrometrics";

export const section09: CalcSection = {
  num: "09",
  title: "Energy & equipment",
  calculators: [
    {
      id: "chiller-efficiency-calculator",
      title: "Chiller Efficiency",
      note: "Use total chiller input power and measured tons at the same operating condition.",
      inputs: [
        { key: "kw", kind: "number", label: "Power Input", unit: "kW", default: "100" },
        { key: "tons", kind: "number", label: "Cooling Output", unit: "tons", default: "150" },
      ],
      compute: (v) => {
        const kw = parseFloat(v.kw);
        const tons = parseFloat(v.tons);
        if (hasInvalidNumbers([kw, tons]) || tons === 0) {
          return [{ label: "Efficiency", value: "—", unit: "kW/ton" }];
        }
        return [{ label: "Efficiency", value: (kw / tons).toFixed(3), unit: "kW/ton" }];
      },
    },
    {
      id: "vfd-energy-savings-calculator",
      title: "VFD Energy Savings",
      note: "Cube-law fan/pump estimate. Real savings depend on static reset, minimum speeds, and operating profile.",
      inputs: [
        { key: "reduction", kind: "number", label: "Speed Reduction", unit: "%", default: "20" },
        { key: "hp", kind: "number", label: "Motor Size", unit: "HP", default: "50" },
        { key: "hours", kind: "number", label: "Operating Hours", unit: "hrs/yr", default: "4000" },
        { key: "cost", kind: "number", label: "Electricity Cost", unit: "$/kWh", default: "0.10" },
      ],
      compute: (v) => {
        const reduction = parseFloat(v.reduction);
        const hp = parseFloat(v.hp);
        const hours = parseFloat(v.hours);
        const cost = parseFloat(v.cost);
        if (hasInvalidNumbers([reduction, hp, hours, cost])) {
          return [
            { label: "Annual kWh Saved", value: "—", unit: "kWh" },
            { label: "Annual Savings", value: "—" },
          ];
        }
        const fullKw = hp * 0.746;
        const reducedKw = fullKw * Math.pow(1 - reduction / 100, 3);
        const savedKw = fullKw - reducedKw;
        const savedKwh = savedKw * hours;
        const savedDollars = savedKwh * cost;
        return [
          {
            label: "Annual kWh Saved",
            value: savedKwh.toLocaleString(undefined, { maximumFractionDigits: 0 }),
            unit: "kWh",
          },
          {
            label: "Annual Savings",
            value: savedDollars.toLocaleString(undefined, { style: "currency", currency: "USD" }),
          },
        ];
      },
    },
    {
      id: "cooling-tower-performance-calculator",
      title: "Cooling Tower Performance",
      note: "Range is entering minus leaving water. Approach is leaving water minus entering wet bulb.",
      inputs: [
        { key: "entering", kind: "number", label: "Entering Water Temp", unit: "°F", default: "95" },
        { key: "leaving", kind: "number", label: "Leaving Water Temp", unit: "°F", default: "85" },
        { key: "wetBulb", kind: "number", label: "Wet Bulb Temp", unit: "°F", default: "78" },
      ],
      compute: (v) => {
        const entering = parseFloat(v.entering);
        const leaving = parseFloat(v.leaving);
        const wb = parseFloat(v.wetBulb);
        if (hasInvalidNumbers([entering, leaving, wb])) {
          return [
            { label: "Range", value: "—", unit: "°F" },
            { label: "Approach", value: "—", unit: "°F" },
          ];
        }
        return [
          { label: "Range", value: (entering - leaving).toFixed(1), unit: "°F" },
          { label: "Approach", value: (leaving - wb).toFixed(1), unit: "°F" },
        ];
      },
    },
  ],
};
