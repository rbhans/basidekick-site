import { describe, expect, it } from "vitest";
import { section08 } from "./08-commissioning";

function calc(id: string) {
  const found = section08.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Sensor Drift Check", () => {
  const c = calc("sensor-drift-check-calculator");

  it("exp=72, act=73, tol=1 -> diff 1.00, at boundary is Within tolerance", () => {
    const [diff, status] = c.compute({ expected: "72", actual: "73", tolerance: "1" });
    expect(diff.value).toBe("1.00");
    expect(status.value).toBe("Within tolerance");
  });

  it("exp=72, act=73.01, tol=1 -> just over boundary is Exceeds tolerance", () => {
    const [diff, status] = c.compute({ expected: "72", actual: "73.01", tolerance: "1" });
    expect(diff.value).toBe("1.01");
    expect(status.value).toBe("Exceeds tolerance");
  });

  it("returns — for blank input", () => {
    const [diff, status] = c.compute({ expected: "", actual: "73", tolerance: "1" });
    expect(diff.value).toBe("—");
    expect(status.value).toBe("—");
  });
});

describe("Actuator Stroke Time", () => {
  const c = calc("actuator-stroke-time-calculator");

  it("90 travel / 30 per sec -> 3 seconds", () => {
    const [row] = c.compute({ travel: "90", speed: "30" });
    expect(row.value).toBe("3 seconds");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ travel: "", speed: "30" });
    expect(row.value).toBe("—");
  });
});

describe("Duct Static Setpoint", () => {
  const c = calc("duct-static-setpoint-calculator");

  it("design 1000 CFM/1.5 in WC, actual 1200 CFM -> 1.5*(1.2)^2 = 2.16 in WC", () => {
    const [row] = c.compute({ designCfm: "1000", designSp: "1.5", actualCfm: "1200" });
    expect(row.value).toBe("2.16");
    expect(row.unit).toBe("in WC");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ designCfm: "", designSp: "1.5", actualCfm: "1200" });
    expect(row.value).toBe("—");
  });
});
