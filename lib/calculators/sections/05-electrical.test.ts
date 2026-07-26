import { describe, expect, it } from "vitest";
import { section05 } from "./05-electrical";

function calc(id: string) {
  const found = section05.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("3-Phase Power", () => {
  const c = calc("3-phase-power-calculator");

  it("V=480, A=10, PF=0.9 -> 7.48 kW", () => {
    const [row] = c.compute({ volts: "480", amps: "10", pf: "0.9" });
    expect(row.value).toBe("7.48");
    expect(row.unit).toBe("kW");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ volts: "", amps: "10", pf: "0.9" });
    expect(row.value).toBe("—");
  });
});

describe("Transformer Sizing", () => {
  const c = calc("transformer-sizing-calculator");

  it("20 loads x 15 VA -> 375 VA, next size 500 VA", () => {
    const [row] = c.compute({ loads: "20", vaEach: "15" });
    expect(row.value).toBe("375 VA (use 500 VA)");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ loads: "", vaEach: "15" });
    expect(row.value).toBe("—");
  });
});

describe("24VAC Wire Gauge", () => {
  const c = calc("24vac-wire-gauge-calculator");

  it("100ft/2A/24V/5% drop -> picks 14 AWG (1.01 V drop)", () => {
    const [row] = c.compute({ length: "100", amps: "2", voltage: "24", dropPct: "5" });
    expect(row.value).toBe("14 AWG (1.01 V drop)");
  });

  it("long run exceeds even 10 AWG -> shorten run message", () => {
    const [row] = c.compute({ length: "300", amps: "3", voltage: "24", dropPct: "3" });
    expect(row.value).toBe(">10 AWG or shorten run");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ length: "", amps: "2", voltage: "24", dropPct: "5" });
    expect(row.value).toBe("—");
  });
});

describe("UPS Runtime", () => {
  const c = calc("ups-runtime-calculator");

  it("216 Wh, 500 W load, 85% efficiency -> ~22 minutes", () => {
    const [row] = c.compute({ wh: "216", loadWatts: "500", efficiency: "85" });
    expect(row.value).toBe("~22 minutes");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ wh: "", loadWatts: "500", efficiency: "85" });
    expect(row.value).toBe("—");
  });
});
