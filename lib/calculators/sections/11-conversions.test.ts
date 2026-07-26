import { describe, expect, it } from "vitest";
import { section11 } from "./11-conversions";

function calc(id: string) {
  const found = section11.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Pressure", () => {
  const c = calc("pressure-conversion-calculator");

  it("1 PSI -> 27.680 in WC (OLD's factor is 27.68, not the textbook 27.6799)", () => {
    const [iwc, pa, psi, kpa] = c.compute({ value: "1", unit: "psi" });
    expect(iwc.value).toBe("27.680");
    expect(pa.value).toBe("6894.81");
    expect(psi.value).toBe("1.0000");
    expect(kpa.value).toBe("6.8947");
  });

  it("249.09 Pa round-trips to 1.000 in WC", () => {
    const [iwc, pa, psi, kpa] = c.compute({ value: "249.09", unit: "pa" });
    expect(iwc.value).toBe("1.000");
    expect(pa.value).toBe("249.09");
    expect(psi.value).toBe("0.0361");
    expect(kpa.value).toBe("0.2491");
  });

  it("returns — for blank input", () => {
    const [iwc, pa, psi, kpa] = c.compute({ value: "", unit: "iwc" });
    expect(iwc.value).toBe("—");
    expect(pa.value).toBe("—");
    expect(psi.value).toBe("—");
    expect(kpa.value).toBe("—");
  });
});

describe("Airflow", () => {
  const c = calc("airflow-cfm-conversion-calculator");

  it("100 CFM -> 47.19 L/s -> 169.9 m3/h", () => {
    const [cfm, ls, m3h] = c.compute({ value: "100", unit: "cfm" });
    expect(cfm.value).toBe("100.0");
    expect(ls.value).toBe("47.19");
    expect(m3h.value).toBe("169.9");
  });

  it("47.19 L/s round-trips back to 100.0 CFM", () => {
    const [cfm, ls, m3h] = c.compute({ value: "47.19", unit: "ls" });
    expect(cfm.value).toBe("100.0");
    expect(ls.value).toBe("47.19");
    expect(m3h.value).toBe("169.9");
  });

  it("returns — for blank input", () => {
    const [cfm, ls, m3h] = c.compute({ value: "", unit: "cfm" });
    expect(cfm.value).toBe("—");
    expect(ls.value).toBe("—");
    expect(m3h.value).toBe("—");
  });
});

describe("Temperature", () => {
  const c = calc("temperature-conversion-calculator");

  it("32 F -> 0 C -> 273.15 K", () => {
    const [f, cVal, k] = c.compute({ value: "32", unit: "f" });
    expect(f.value).toBe("32.00");
    expect(cVal.value).toBe("0.00");
    expect(k.value).toBe("273.15");
  });

  it("100 C -> 212 F -> 373.15 K", () => {
    const [f, cVal, k] = c.compute({ value: "100", unit: "c" });
    expect(f.value).toBe("212.00");
    expect(cVal.value).toBe("100.00");
    expect(k.value).toBe("373.15");
  });

  it("273.15 K -> 32 F -> 0 C", () => {
    const [f, cVal, k] = c.compute({ value: "273.15", unit: "k" });
    expect(f.value).toBe("32.00");
    expect(cVal.value).toBe("0.00");
    expect(k.value).toBe("273.15");
  });

  it("returns — for blank input", () => {
    const [f, cVal, k] = c.compute({ value: "", unit: "f" });
    expect(f.value).toBe("—");
    expect(cVal.value).toBe("—");
    expect(k.value).toBe("—");
  });
});
