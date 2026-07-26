import type { CalcSection } from "../types";
import { hasInvalidNumbers, wireGaugeTable } from "../psychrometrics";

export const section05: CalcSection = {
  num: "05",
  title: "Electrical & power",
  calculators: [
    {
      id: "3-phase-power-calculator",
      title: "3-Phase Power",
      note: "Balanced three-phase estimate: kW = V x A x sqrt(3) x PF / 1000.",
      inputs: [
        { key: "volts", kind: "number", label: "Voltage", unit: "V", default: "480" },
        { key: "amps", kind: "number", label: "Current", unit: "A", default: "50" },
        { key: "pf", kind: "number", label: "Power Factor", default: "0.85" },
      ],
      compute: (v) => {
        const volts = parseFloat(v.volts);
        const amps = parseFloat(v.amps);
        const pf = parseFloat(v.pf);
        if (hasInvalidNumbers([volts, amps, pf])) {
          return [{ label: "Power", value: "—", unit: "kW" }];
        }
        const kw = (volts * amps * Math.sqrt(3) * pf) / 1000;
        return [{ label: "Power", value: kw.toFixed(2), unit: "kW" }];
      },
    },
    {
      id: "transformer-sizing-calculator",
      title: "Transformer Sizing",
      note: "Adds 25% spare capacity before selecting the next listed transformer size.",
      inputs: [
        { key: "loads", kind: "number", label: "Number of Loads", default: "20" },
        { key: "vaEach", kind: "number", label: "VA per Load", unit: "VA", default: "15" },
      ],
      compute: (v) => {
        const loads = parseInt(v.loads, 10);
        const va = parseFloat(v.vaEach);
        if (Number.isNaN(loads) || Number.isNaN(va)) {
          return [{ label: "Recommended Size", value: "—" }];
        }
        const total = loads * va * 1.25;
        const sizes = [50, 75, 100, 150, 200, 300, 500, 750, 1000];
        const recommended = sizes.find((s) => s >= total) || sizes[sizes.length - 1];
        return [{ label: "Recommended Size", value: `${Math.ceil(total)} VA (use ${recommended} VA)` }];
      },
    },
    {
      id: "24vac-wire-gauge-calculator",
      title: "24VAC Wire Gauge",
      note: "Copper two-conductor loop using NEC-style AWG resistance values; check local code and device minimum voltage.",
      inputs: [
        { key: "length", kind: "number", label: "One-Way Distance", unit: "ft", default: "100" },
        { key: "amps", kind: "number", label: "Load Current", unit: "A", default: "2" },
        { key: "voltage", kind: "number", label: "Control Voltage", unit: "V", default: "24" },
        { key: "dropPct", kind: "number", label: "Max Voltage Drop", unit: "%", default: "5" },
      ],
      compute: (v) => {
        const len = parseFloat(v.length);
        const amps = parseFloat(v.amps);
        const volts = parseFloat(v.voltage);
        const dropPct = parseFloat(v.dropPct);
        if (hasInvalidNumbers([len, amps, volts, dropPct]) || volts <= 0 || dropPct <= 0) {
          return [{ label: "Recommended Gauge", value: "—" }];
        }
        const maxDrop = volts * (dropPct / 100);
        const selected = wireGaugeTable.find((wire) => {
          const drop = (2 * len * amps * wire.ohmsPer1000Ft) / 1000;
          return drop <= maxDrop;
        });
        if (!selected) {
          return [{ label: "Recommended Gauge", value: ">10 AWG or shorten run" }];
        }
        const drop = (2 * len * amps * selected.ohmsPer1000Ft) / 1000;
        return [{ label: "Recommended Gauge", value: `${selected.gauge} AWG (${drop.toFixed(2)} V drop)` }];
      },
    },
    {
      id: "ups-runtime-calculator",
      title: "UPS Runtime",
      note: "Runtime from battery Wh is more honest than VA nameplate. Use vendor curves for final backup claims.",
      inputs: [
        { key: "wh", kind: "number", label: "Battery Energy", unit: "Wh", default: "216" },
        { key: "loadWatts", kind: "number", label: "Connected Load", unit: "W", default: "500" },
        { key: "efficiency", kind: "number", label: "Inverter Efficiency", unit: "%", default: "85" },
      ],
      compute: (v) => {
        const wh = parseFloat(v.wh);
        const load = parseFloat(v.loadWatts);
        const efficiency = parseFloat(v.efficiency);
        if (hasInvalidNumbers([wh, load, efficiency]) || load <= 0) {
          return [{ label: "Estimated Runtime", value: "—" }];
        }
        const runtime = ((wh * (efficiency / 100)) / load) * 60;
        return [{ label: "Estimated Runtime", value: `~${Math.round(runtime)} minutes` }];
      },
    },
  ],
};
