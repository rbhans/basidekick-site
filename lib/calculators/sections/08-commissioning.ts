import type { CalcSection } from "../types";
import { hasInvalidNumbers } from "../psychrometrics";

export const section08: CalcSection = {
  num: "08",
  title: "Commissioning & troubleshooting",
  calculators: [
    {
      id: "sensor-drift-check-calculator",
      title: "Sensor Drift Check",
      note: "Compare against a calibrated reference, not another unverified BAS value.",
      inputs: [
        { key: "expected", kind: "number", label: "Expected Value", default: "72" },
        { key: "actual", kind: "number", label: "Actual Reading", default: "73.5" },
        { key: "tolerance", kind: "number", label: "Tolerance", unit: "±", default: "1" },
      ],
      compute: (v) => {
        const exp = parseFloat(v.expected);
        const act = parseFloat(v.actual);
        const tol = parseFloat(v.tolerance);
        if (hasInvalidNumbers([exp, act, tol])) {
          return [
            { label: "Deviation", value: "—" },
            { label: "Status", value: "—" },
          ];
        }
        const diff = act - exp;
        const status = Math.abs(diff) <= tol ? "Within tolerance" : "Exceeds tolerance";
        return [
          { label: "Deviation", value: diff.toFixed(2) },
          { label: "Status", value: status },
        ];
      },
    },
    {
      id: "actuator-stroke-time-calculator",
      title: "Actuator Stroke Time",
      note: "Use actuator nameplate speed under load where available.",
      inputs: [
        { key: "travel", kind: "number", label: "Travel (degrees or %)", default: "90" },
        { key: "speed", kind: "number", label: "Speed (per second)", unit: "/sec", default: "30" },
      ],
      compute: (v) => {
        const travel = parseFloat(v.travel);
        const speed = parseFloat(v.speed);
        if (hasInvalidNumbers([travel, speed]) || speed === 0) {
          return [{ label: "Full Stroke Time", value: "—" }];
        }
        const time = travel / speed;
        return [{ label: "Full Stroke Time", value: `${time.toFixed(0)} seconds` }];
      },
    },
    {
      id: "duct-static-setpoint-calculator",
      title: "Duct Static Setpoint",
      note: "Fan-law square relationship for a rough reset curve point, not a balancing substitute.",
      inputs: [
        { key: "designCfm", kind: "number", label: "Design CFM", unit: "CFM", default: "10000" },
        { key: "designSp", kind: "number", label: "Design Static", unit: "in WC", default: "2.5" },
        { key: "actualCfm", kind: "number", label: "Actual CFM", unit: "CFM", default: "7500" },
      ],
      compute: (v) => {
        const designCfm = parseFloat(v.designCfm);
        const designSp = parseFloat(v.designSp);
        const actualCfm = parseFloat(v.actualCfm);
        if (hasInvalidNumbers([designCfm, designSp, actualCfm]) || designCfm === 0) {
          return [{ label: "Adjusted Setpoint", value: "—", unit: "in WC" }];
        }
        const newSp = designSp * Math.pow(actualCfm / designCfm, 2);
        return [{ label: "Adjusted Setpoint", value: newSp.toFixed(2), unit: "in WC" }];
      },
    },
  ],
};
