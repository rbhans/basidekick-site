import { describe, expect, it } from "vitest";
import { section09 } from "./09-energy";

function calc(id: string) {
  const found = section09.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Chiller Efficiency", () => {
  const c = calc("chiller-efficiency-calculator");

  it("100 kW / 50 tons -> 2.000 kW/ton", () => {
    const [row] = c.compute({ kw: "100", tons: "50" });
    expect(row.value).toBe("2.000");
    expect(row.unit).toBe("kW/ton");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ kw: "", tons: "50" });
    expect(row.value).toBe("—");
  });

  it("returns — when tons is 0", () => {
    const [row] = c.compute({ kw: "100", tons: "0" });
    expect(row.value).toBe("—");
  });
});

describe("VFD Energy Savings", () => {
  const c = calc("vfd-energy-savings-calculator");

  it("20% reduction, 10 HP, 4000 hrs/yr, $0.10/kWh -> matches OLD's HP->kW (0.746) and cube law", () => {
    // fullKw = 10 * 0.746 = 7.46
    // reducedKw = 7.46 * (0.8)^3 = 3.81952
    // savedKw = 3.64048; savedKwh = 3.64048 * 4000 = 14561.92 -> "14,562"
    // savedDollars = 14561.92 * 0.10 = 1456.192 -> "$1,456.19"
    const [kwh, dollars] = c.compute({ reduction: "20", hp: "10", hours: "4000", cost: "0.10" });
    expect(kwh.value).toBe("14,562");
    expect(kwh.unit).toBe("kWh");
    expect(dollars.value).toBe("$1,456.19");
  });

  it("returns — for blank input", () => {
    const [kwh, dollars] = c.compute({ reduction: "", hp: "10", hours: "4000", cost: "0.10" });
    expect(kwh.value).toBe("—");
    expect(dollars.value).toBe("—");
  });
});

describe("Cooling Tower Performance", () => {
  const c = calc("cooling-tower-performance-calculator");

  it("entering 95, leaving 85, wetbulb 78 -> range 10.0, approach 7.0", () => {
    const [range, approach] = c.compute({ entering: "95", leaving: "85", wetBulb: "78" });
    expect(range.value).toBe("10.0");
    expect(approach.value).toBe("7.0");
  });

  it("returns — for blank input", () => {
    const [range, approach] = c.compute({ entering: "", leaving: "85", wetBulb: "78" });
    expect(range.value).toBe("—");
    expect(approach.value).toBe("—");
  });
});
