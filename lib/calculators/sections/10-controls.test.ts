import { describe, expect, it } from "vitest";
import { section10 } from "./10-controls";

function calc(id: string) {
  const found = section10.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("PID Tuning (Ziegler-Nichols)", () => {
  const c = calc("pid-tuning-ziegler-nichols-calculator");

  it("Ku=2, Tu=10 -> Kp=1.200, Ki=0.2400, Kd=1.50", () => {
    const [kp, ki, kd] = c.compute({ ku: "2", tu: "10" });
    expect(kp.value).toBe("1.200");
    expect(ki.value).toBe("0.2400");
    expect(kd.value).toBe("1.50");
  });

  it("returns — for blank input", () => {
    const [kp, ki, kd] = c.compute({ ku: "", tu: "10" });
    expect(kp.value).toBe("—");
    expect(ki.value).toBe("—");
    expect(kd.value).toBe("—");
  });

  it("returns — when Tu is 0", () => {
    const [kp] = c.compute({ ku: "2", tu: "0" });
    expect(kp.value).toBe("—");
  });
});

describe("OAT Reset Schedule", () => {
  const c = calc("oat-reset-schedule-calculator");

  it("midpoint OAT (35 between 0 and 70) -> SP interpolates to 160.0", () => {
    const [row] = c.compute({ oatMin: "0", oatMax: "70", spMin: "180", spMax: "140", oatCurrent: "35" });
    expect(row.value).toBe("160.0");
    expect(row.unit).toBe("°F");
  });

  it("clamps to SP-at-max when OAT is above OAT max", () => {
    const [row] = c.compute({ oatMin: "0", oatMax: "70", spMin: "180", spMax: "140", oatCurrent: "100" });
    expect(row.value).toBe("140.0");
  });

  it("clamps to SP-at-min when OAT is below OAT min", () => {
    const [row] = c.compute({ oatMin: "0", oatMax: "70", spMin: "180", spMax: "140", oatCurrent: "-10" });
    expect(row.value).toBe("180.0");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ oatMin: "", oatMax: "70", spMin: "180", spMax: "140", oatCurrent: "35" });
    expect(row.value).toBe("—");
  });

  it("returns — when oatMax equals oatMin", () => {
    const [row] = c.compute({ oatMin: "50", oatMax: "50", spMin: "180", spMax: "140", oatCurrent: "35" });
    expect(row.value).toBe("—");
  });
});
