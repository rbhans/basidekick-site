import { describe, expect, it } from "vitest";
import { section04 } from "./04-hydronic";

function calc(id: string) {
  const found = section04.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Pump Head Pressure", () => {
  const c = calc("pump-head-pressure-calculator");

  it("gpm=100, length=200ft, size=2in, C=140 -> ~16.6 ft H2O (Hazen-Williams)", () => {
    const [row] = c.compute({ gpm: "100", length: "200", size: "2", cFactor: "140" });
    expect(row.value).toBe("16.6");
    expect(row.unit).toBe("ft H₂O");
  });

  it("returns — for zero pipe size", () => {
    const [row] = c.compute({ gpm: "100", length: "200", size: "0", cFactor: "140" });
    expect(row.value).toBe("—");
  });
});

describe("Glycol Effects", () => {
  const c = calc("glycol-effects-calculator");

  it("30% glycol -> 85% capacity, +9% flow increase", () => {
    const [capacity, flow] = c.compute({ glycolPercent: "30" });
    expect(capacity.value).toBe("85%");
    expect(flow.value).toBe("+9%");
  });

  it("returns — for blank input", () => {
    const [capacity, flow] = c.compute({ glycolPercent: "" });
    expect(capacity.value).toBe("—");
    expect(flow.value).toBe("—");
  });
});

describe("Expansion Tank Sizing", () => {
  const c = calc("expansion-tank-sizing-calculator");

  it("vol=100gal, dt=40, fill=12psig, max=28psig -> 0.92 gal expansion, 2.5 gal tank", () => {
    const [expansion, tank] = c.compute({ volume: "100", deltaT: "40", fillPressure: "12", maxPressure: "28" });
    expect(expansion.value).toBe("0.92");
    expect(tank.value).toBe("2.5");
  });

  it("returns — when max pressure <= fill pressure", () => {
    const [expansion, tank] = c.compute({ volume: "100", deltaT: "40", fillPressure: "28", maxPressure: "28" });
    expect(expansion.value).toBe("—");
    expect(tank.value).toBe("—");
  });
});

describe("Valve Cv Calculator", () => {
  const c = calc("valve-cv-calculator");

  it("flow=10, dp=4, sg=1 -> Cv=5.0", () => {
    const [row] = c.compute({ flow: "10", deltaP: "4", sg: "1" });
    expect(row.value).toBe("5.0");
  });

  it("returns — for zero pressure drop", () => {
    const [row] = c.compute({ flow: "10", deltaP: "0", sg: "1" });
    expect(row.value).toBe("—");
  });
});

describe("BTU from Flow", () => {
  const c = calc("btu-from-flow-calculator");

  it("gpm=10, deltaT=20 -> 100,000 BTU/hr, 8.33 tons", () => {
    const [btu, tons] = c.compute({ gpm: "10", deltaT: "20" });
    expect(btu.value).toBe("100,000");
    expect(tons.value).toBe("8.33");
  });

  it("returns — for blank input", () => {
    const [btu, tons] = c.compute({ gpm: "", deltaT: "20" });
    expect(btu.value).toBe("—");
    expect(tons.value).toBe("—");
  });
});
