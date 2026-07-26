import { describe, expect, it } from "vitest";
import { section02 } from "./02-airside";

function calc(id: string) {
  const found = section02.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Air Changes per Hour", () => {
  const c = calc("air-changes-per-hour-calculator");

  it("cfm=500, 20x15x10 ft room -> 10.00 ACH", () => {
    const [row] = c.compute({ cfm: "500", length: "20", width: "15", height: "10" });
    expect(row.value).toBe("10.00");
    expect(row.unit).toBe("ACH");
  });

  it("returns — for zero-volume room", () => {
    const [row] = c.compute({ cfm: "500", length: "0", width: "15", height: "10" });
    expect(row.value).toBe("—");
  });
});

describe("Mixed Air Temperature", () => {
  const c = calc("mixed-air-temperature-calculator");

  it("OA=40, RA=72, OA fraction=30% -> 62.4°F", () => {
    const [row] = c.compute({ oaTemp: "40", raTemp: "72", oaFraction: "30" });
    expect(row.value).toBe("62.4");
    expect(row.unit).toBe("°F");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ oaTemp: "", raTemp: "72", oaFraction: "30" });
    expect(row.value).toBe("—");
  });
});

describe("Economizer Enthalpy", () => {
  const c = calc("economizer-enthalpy-calculator");

  it("75°F/50% RH -> ~28.07 Btu/lb via the corrected saturation-pressure helper", () => {
    const [row] = c.compute({ temp: "75", rh: "50" });
    expect(parseFloat(row.value)).toBeCloseTo(28.07, 1);
    expect(row.unit).toBe("BTU/lb");
  });

  it("default inputs (70°F/50% RH) -> ~25.27 Btu/lb", () => {
    const [row] = c.compute({ temp: "70", rh: "50" });
    expect(parseFloat(row.value)).toBeCloseTo(25.27, 1);
  });
});

describe("Optimal Start Time", () => {
  const c = calc("optimal-start-time-calculator");

  it("deltaT=10, medium mass (factor 5) -> 50 minutes", () => {
    const [row] = c.compute({ deltaT: "10", mass: "medium" });
    expect(row.value).toBe("50 minutes");
  });

  it("light mass uses factor 3", () => {
    const [row] = c.compute({ deltaT: "10", mass: "light" });
    expect(row.value).toBe("30 minutes");
  });

  it("returns — for blank deltaT", () => {
    const [row] = c.compute({ deltaT: "", mass: "medium" });
    expect(row.value).toBe("—");
  });
});
