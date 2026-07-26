import { describe, expect, it } from "vitest";
import { section01 } from "./01-sensor-signal";

function calc(id: string) {
  const found = section01.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Analog Input Scaling", () => {
  const c = calc("analog-input-scaling-calculator");

  it("scales a known linear map (raw 4-20 -> eng 0-100, raw=12 -> 50.00)", () => {
    const [row] = c.compute({ rawMin: "4", rawMax: "20", engMin: "0", engMax: "100", raw: "12" });
    expect(row.value).toBe("50.00");
    expect(row.unit).toBe("eng");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ rawMin: "", rawMax: "20", engMin: "0", engMax: "100", raw: "12" });
    expect(row.value).toBe("—");
  });

  it("returns — when rawMax === rawMin", () => {
    const [row] = c.compute({ rawMin: "10", rawMax: "10", engMin: "0", engMax: "100", raw: "12" });
    expect(row.value).toBe("—");
  });
});

describe("Thermistor Temperature", () => {
  const c = calc("thermistor-temperature-calculator");

  it("R = R25 -> T = 25.0°C / 77.0°F exactly (beta eqn collapses to ln(1)=0)", () => {
    const [row] = c.compute({ thermType: "10k-3892", resistance: "10000" });
    expect(row.value).toBe("25.0°C / 77.0°F");
  });

  it("returns — for non-positive resistance", () => {
    const [row] = c.compute({ thermType: "10k-3892", resistance: "0" });
    expect(row.value).toBe("—");
  });
});

describe("Pressure with Elevation", () => {
  const c = calc("pressure-with-elevation-calculator");

  it("elevation=0 -> corrected equals input pressure", () => {
    const [row] = c.compute({ pressure: "14.7", elevation: "0" });
    expect(row.value).toBe("14.700");
    expect(row.unit).toBe("psia");
  });

  it("elevation=5000 ft -> ~17.667 psia", () => {
    const [row] = c.compute({ pressure: "14.7", elevation: "5000" });
    expect(parseFloat(row.value)).toBeCloseTo(17.667, 2);
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ pressure: "", elevation: "0" });
    expect(row.value).toBe("—");
  });
});
