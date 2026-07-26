import { describe, expect, it } from "vitest";
import { section06 } from "./06-psychrometrics";

function calc(id: string) {
  const found = section06.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Dew Point", () => {
  const c = calc("dew-point-calculator");

  it("72°F/50% RH -> 52.3°F / 11.3°C (Magnus)", () => {
    const [row] = c.compute({ temp: "72", rh: "50" });
    expect(row.value).toBe("52.3°F / 11.3°C");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ temp: "", rh: "50" });
    expect(row.value).toBe("—");
  });
});

describe("Enthalpy", () => {
  const c = calc("enthalpy-calculator");

  it("75°F/50% RH -> ~28.07 BTU/lb (real value with corrected saturation-pressure helper)", () => {
    const [row] = c.compute({ temp: "75", rh: "50" });
    expect(row.value).toBe("28.07");
    expect(row.unit).toBe("BTU/lb");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ temp: "", rh: "50" });
    expect(row.value).toBe("—");
  });
});

describe("Wet Bulb Temperature", () => {
  const c = calc("wet-bulb-temperature-calculator");

  it("80°F/60% RH -> 69.8°F / 21.0°C (Stull approximation)", () => {
    const [row] = c.compute({ temp: "80", rh: "60" });
    expect(row.value).toBe("69.8°F / 21.0°C");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ temp: "", rh: "60" });
    expect(row.value).toBe("—");
  });
});

describe("Humidity Ratio", () => {
  const c = calc("humidity-ratio-calculator");

  it("75°F/50% RH -> 64.4 gr/lb, 9.205 lb/1000lb (W≈0.009205 lb/lb)", () => {
    const [grains, lbm] = c.compute({ temp: "75", rh: "50" });
    expect(grains.value).toBe("64.4");
    expect(grains.unit).toBe("gr/lb");
    expect(lbm.value).toBe("9.205");
  });

  it("returns — for blank input", () => {
    const [grains, lbm] = c.compute({ temp: "", rh: "50" });
    expect(grains.value).toBe("—");
    expect(lbm.value).toBe("—");
  });
});
