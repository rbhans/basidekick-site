import type { CalcSection } from "../types";
import { hasInvalidNumbers, getHumidityRatio, getMoistAirEnthalpy } from "../psychrometrics";

export const section06: CalcSection = {
  num: "06",
  title: "Psychrometrics",
  calculators: [
    {
      id: "dew-point-calculator",
      title: "Dew Point",
      note: "Magnus approximation, suitable for quick HVAC checks.",
      inputs: [
        { key: "temp", kind: "number", label: "Dry Bulb Temp", unit: "°F", default: "72" },
        { key: "rh", kind: "number", label: "Relative Humidity", unit: "%", default: "50" },
      ],
      compute: (v) => {
        const t = parseFloat(v.temp);
        const rh = parseFloat(v.rh);
        if (hasInvalidNumbers([t, rh]) || rh <= 0) {
          return [{ label: "Dew Point", value: "—" }];
        }
        const tc = ((t - 32) * 5) / 9;
        const a = 17.27,
          b = 237.7;
        const alpha = (a * tc) / (b + tc) + Math.log(rh / 100);
        const dpC = (b * alpha) / (a - alpha);
        const dpF = (dpC * 9) / 5 + 32;
        return [{ label: "Dew Point", value: `${dpF.toFixed(1)}°F / ${dpC.toFixed(1)}°C` }];
      },
    },
    {
      id: "enthalpy-calculator",
      title: "Enthalpy",
      note: "Sea-level moist-air estimate. Use a psychrometric tool when elevation matters.",
      inputs: [
        { key: "temp", kind: "number", label: "Dry Bulb Temp", unit: "°F", default: "75" },
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
      id: "wet-bulb-temperature-calculator",
      title: "Wet Bulb Temperature",
      note: "Approximation for normal meteorological ranges, not a replacement for a psychrometric chart.",
      inputs: [
        { key: "temp", kind: "number", label: "Dry Bulb Temp", unit: "°F", default: "80" },
        { key: "rh", kind: "number", label: "Relative Humidity", unit: "%", default: "60" },
      ],
      compute: (v) => {
        const t = parseFloat(v.temp);
        const rh = parseFloat(v.rh);
        if (hasInvalidNumbers([t, rh]) || rh < 0 || rh > 100) {
          return [{ label: "Wet Bulb", value: "—" }];
        }
        const tc = ((t - 32) * 5) / 9;
        const wb =
          tc * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
          Math.atan(tc + rh) -
          Math.atan(rh - 1.676331) +
          0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
          4.686035;
        const wbF = (wb * 9) / 5 + 32;
        return [{ label: "Wet Bulb", value: `${wbF.toFixed(1)}°F / ${wb.toFixed(1)}°C` }];
      },
    },
    {
      id: "humidity-ratio-calculator",
      title: "Humidity Ratio",
      note: "Sea-level pressure basis; humidity ratio changes with barometric pressure.",
      inputs: [
        { key: "temp", kind: "number", label: "Dry Bulb Temp", unit: "°F", default: "75" },
        { key: "rh", kind: "number", label: "Relative Humidity", unit: "%", default: "50" },
      ],
      compute: (v) => {
        const t = parseFloat(v.temp);
        const rh = parseFloat(v.rh);
        if (hasInvalidNumbers([t, rh])) {
          return [
            { label: "Grains/lb dry air", value: "—", unit: "gr/lb" },
            { label: "lb moisture/1000 lb air", value: "—" },
          ];
        }
        const w = getHumidityRatio(t, rh);
        if (!Number.isFinite(w)) {
          return [
            { label: "Grains/lb dry air", value: "—", unit: "gr/lb" },
            { label: "lb moisture/1000 lb air", value: "—" },
          ];
        }
        const grains = w * 7000;
        return [
          { label: "Grains/lb dry air", value: grains.toFixed(1), unit: "gr/lb" },
          { label: "lb moisture/1000 lb air", value: (w * 1000).toFixed(3) },
        ];
      },
    },
  ],
};
