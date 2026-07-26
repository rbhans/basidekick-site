import type { CalcSection } from "../types";
import { hasInvalidNumbers, thermistorPresets } from "../psychrometrics";

export const section01: CalcSection = {
  num: "01",
  title: "Sensor & signal scaling",
  calculators: [
    {
      id: "analog-input-scaling-calculator",
      title: "Analog Input Scaling",
      note: "Linear scaling only. For live-zero signals, verify fault handling separately.",
      inputs: [
        { key: "rawMin", kind: "number", label: "Raw Min", unit: "mA/V", default: "4" },
        { key: "rawMax", kind: "number", label: "Raw Max", unit: "mA/V", default: "20" },
        { key: "engMin", kind: "number", label: "Eng Min", default: "0" },
        { key: "engMax", kind: "number", label: "Eng Max", default: "100" },
        { key: "raw", kind: "number", label: "Raw Input Value", unit: "mA/V", default: "12" },
      ],
      compute: (v) => {
        const rawMin = parseFloat(v.rawMin);
        const rawMax = parseFloat(v.rawMax);
        const engMin = parseFloat(v.engMin);
        const engMax = parseFloat(v.engMax);
        const raw = parseFloat(v.raw);
        if (hasInvalidNumbers([rawMin, rawMax, engMin, engMax, raw]) || rawMax === rawMin) {
          return [{ label: "Scaled Output", value: "—", unit: "eng" }];
        }
        const scaled = ((raw - rawMin) / (rawMax - rawMin)) * (engMax - engMin) + engMin;
        return [{ label: "Scaled Output", value: scaled.toFixed(2), unit: "eng" }];
      },
    },
    {
      id: "thermistor-temperature-calculator",
      title: "Thermistor Temperature",
      note: "Beta-curve approximation. Use the sensor manufacturer table for commissioning.",
      inputs: [
        {
          key: "thermType",
          kind: "select",
          label: "Thermistor Type",
          default: "10k-3892",
          options: Object.entries(thermistorPresets).map(([value, preset]) => ({
            value,
            label: preset.label,
          })),
        },
        { key: "resistance", kind: "number", label: "Resistance", unit: "Ω", default: "10000" },
      ],
      compute: (v) => {
        const r = parseFloat(v.resistance);
        const preset = thermistorPresets[v.thermType];
        if (!preset || Number.isNaN(r) || r <= 0) {
          return [{ label: "Temperature", value: "—" }];
        }
        const tKelvin = 1 / (1 / 298.15 + Math.log(r / preset.r25) / preset.beta);
        const tCelsius = tKelvin - 273.15;
        const tFahrenheit = (tCelsius * 9) / 5 + 32;
        return [
          { label: "Temperature", value: `${tCelsius.toFixed(1)}°C / ${tFahrenheit.toFixed(1)}°F` },
        ];
      },
    },
    {
      id: "pressure-with-elevation-calculator",
      title: "Pressure with Elevation",
      note: "Uses the standard atmosphere pressure relation; enter absolute station pressure.",
      inputs: [
        { key: "pressure", kind: "number", label: "Station Pressure", unit: "psia", default: "14.7" },
        { key: "elevation", kind: "number", label: "Elevation", unit: "ft", default: "0" },
      ],
      compute: (v) => {
        const p = parseFloat(v.pressure);
        const elev = parseFloat(v.elevation);
        if (hasInvalidNumbers([p, elev]) || p <= 0) {
          return [{ label: "Sea-Level Equivalent", value: "—", unit: "psia" }];
        }
        const atmosphereRatio = Math.pow(1 - 0.00000687535 * elev, 5.2559);
        if (atmosphereRatio <= 0) {
          return [{ label: "Sea-Level Equivalent", value: "—", unit: "psia" }];
        }
        const corrected = p / atmosphereRatio;
        return [{ label: "Sea-Level Equivalent", value: corrected.toFixed(3), unit: "psia" }];
      },
    },
  ],
};
