import type { CalcSection } from "../types";
import { hasInvalidNumbers } from "../psychrometrics";

export const section10: CalcSection = {
  num: "10",
  title: "Controls math",
  calculators: [
    {
      id: "pid-tuning-ziegler-nichols-calculator",
      title: "PID Tuning (Ziegler-Nichols)",
      note: "Ziegler-Nichols can be aggressive. Use cautiously on real equipment and trend the result.",
      inputs: [
        { key: "ku", kind: "number", label: "Ultimate Gain (Ku)", default: "2" },
        { key: "tu", kind: "number", label: "Ultimate Period (Tu)", unit: "sec", default: "60" },
      ],
      compute: (v) => {
        const ku = parseFloat(v.ku);
        const tu = parseFloat(v.tu);
        if (hasInvalidNumbers([ku, tu]) || tu === 0) {
          return [
            { label: "Kp (Proportional)", value: "—" },
            { label: "Ki (Integral)", value: "—" },
            { label: "Kd (Derivative)", value: "—" },
          ];
        }
        return [
          { label: "Kp (Proportional)", value: (0.6 * ku).toFixed(3) },
          { label: "Ki (Integral)", value: ((1.2 * ku) / tu).toFixed(4) },
          { label: "Kd (Derivative)", value: (0.075 * ku * tu).toFixed(2) },
        ];
      },
    },
    {
      id: "oat-reset-schedule-calculator",
      title: "OAT Reset Schedule",
      note: "Linear reset only. Clamp limits and equipment safeties still belong in the controller logic.",
      inputs: [
        { key: "oatMin", kind: "number", label: "OAT Min", unit: "°F", default: "0" },
        { key: "oatMax", kind: "number", label: "OAT Max", unit: "°F", default: "70" },
        { key: "spMin", kind: "number", label: "SP at Min OAT", unit: "°F", default: "180" },
        { key: "spMax", kind: "number", label: "SP at Max OAT", unit: "°F", default: "140" },
        { key: "oatCurrent", kind: "number", label: "Current OAT", unit: "°F", default: "35" },
      ],
      compute: (v) => {
        const oatMin = parseFloat(v.oatMin);
        const oatMax = parseFloat(v.oatMax);
        const spMin = parseFloat(v.spMin);
        const spMax = parseFloat(v.spMax);
        const oat = parseFloat(v.oatCurrent);
        if (hasInvalidNumbers([oatMin, oatMax, spMin, spMax, oat]) || oatMax === oatMin) {
          return [{ label: "Calculated Setpoint", value: "—", unit: "°F" }];
        }
        const ratio = Math.max(0, Math.min(1, (oat - oatMin) / (oatMax - oatMin)));
        const sp = spMin + ratio * (spMax - spMin);
        return [{ label: "Calculated Setpoint", value: sp.toFixed(1), unit: "°F" }];
      },
    },
  ],
};
