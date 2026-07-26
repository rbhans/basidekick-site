import { describe, expect, it } from "vitest";
import {
  STANDARD_ATMOSPHERE_PSI,
  thermistorPresets,
  wireGaugeTable,
  hasInvalidNumbers,
  saturationVaporPressurePsi,
  getHumidityRatio,
  getMoistAirEnthalpy,
} from "./psychrometrics";

describe("constants", () => {
  it("STANDARD_ATMOSPHERE_PSI is 14.696", () => {
    expect(STANDARD_ATMOSPHERE_PSI).toBe(14.696);
  });

  it("thermistorPresets['10k-3977'].beta is 3977", () => {
    expect(thermistorPresets["10k-3977"].beta).toBe(3977);
  });

  it("wireGaugeTable has 6 entries, first gauge '20'", () => {
    expect(wireGaugeTable).toHaveLength(6);
    expect(wireGaugeTable[0].gauge).toBe("20");
  });
});

describe("hasInvalidNumbers", () => {
  it("returns true for [NaN]", () => {
    expect(hasInvalidNumbers([NaN])).toBe(true);
  });

  it("returns false for [1, 2, 3]", () => {
    expect(hasInvalidNumbers([1, 2, 3])).toBe(false);
  });

  it("returns true for [Infinity]", () => {
    expect(hasInvalidNumbers([Infinity])).toBe(true);
  });
});

describe("saturationVaporPressurePsi", () => {
  it("gives a physically sane ~0.362 psi at 70F", () => {
    // kelvin = (70-32)*5/9 + 273.15 = 294.2611...
    // pascals = exp(77.345 + 0.0057*K - 7235/K) / K^8.2
    // psi = pascals / 6894.757 = 0.362088 psi
    // (Reference: saturation pressure of water at ~21.1°C is ~2.5 kPa ≈ 0.36 psi.)
    expect(saturationVaporPressurePsi(70)).toBeCloseTo(0.362088, 4);
  });
});

describe("getHumidityRatio", () => {
  it("computes ~0.009205 lb/lb at 75F/50% RH", () => {
    // vaporPressure = 0.5 * saturationVaporPressurePsi(75)
    // W = 0.62198 * vp / (14.696 - vp) = 0.00920479 lb/lb
    expect(getHumidityRatio(75, 50)).toBeCloseTo(0.009205, 5);
  });

  it("returns NaN when saturation pressure exceeds ambient (230F/100% RH)", () => {
    // saturationVaporPressurePsi(230) ≈ 20.71 psi > STANDARD_ATMOSPHERE_PSI
    // (water boils / sat pressure passes 14.696 psi near 212°F), so at 100% RH
    // vaporPressure >= ambient and the function short-circuits to NaN.
    expect(Number.isNaN(getHumidityRatio(230, 100))).toBe(true);
  });
});

describe("getMoistAirEnthalpy", () => {
  it("computes ~28.07 Btu/lb at 75F/50% RH", () => {
    // W = getHumidityRatio(75, 50) = 0.00920479
    // h = 0.24*75 + W*(1061 + 0.444*75) = 28.0728 Btu/lb
    expect(getMoistAirEnthalpy(75, 50)).toBeCloseTo(28.0728, 3);
  });

  it("returns NaN when the underlying humidity ratio is NaN (230F/100% RH)", () => {
    expect(Number.isNaN(getMoistAirEnthalpy(230, 100))).toBe(true);
  });
});
