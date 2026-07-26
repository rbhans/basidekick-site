import { describe, expect, it } from "vitest";
import { section07 } from "./07-scheduling";

function calc(id: string) {
  const found = section07.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("Optimal Stop Time", () => {
  const c = calc("optimal-stop-time-calculator");

  it("30 min coast, occ end 17:00 -> 16:30", () => {
    const [row] = c.compute({ coastTime: "30", occEnd: "17:00" });
    expect(row.value).toBe("16:30");
  });

  it("rolls over midnight: 30 min coast, occ end 00:10 -> 23:40", () => {
    const [row] = c.compute({ coastTime: "30", occEnd: "00:10" });
    expect(row.value).toBe("23:40");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ coastTime: "", occEnd: "17:00" });
    expect(row.value).toBe("—");
  });
});

describe("Holiday Date (nth Weekday)", () => {
  const c = calc("holiday-date-calculator");

  it("3rd Monday of Jan 2026 -> January 19, 2026", () => {
    const [row] = c.compute({ month: "1", nth: "3", dayOfWeek: "1", year: "2026" });
    expect(row.value).toBe("January 19, 2026");
  });

  it("4th Thursday of Nov 2026 (Thanksgiving, old defaults) -> November 26, 2026", () => {
    const [row] = c.compute({ month: "11", nth: "4", dayOfWeek: "4", year: "2026" });
    expect(row.value).toBe("November 26, 2026");
  });

  it("Last Monday of May 2026 -> May 25, 2026", () => {
    const [row] = c.compute({ month: "5", nth: "-1", dayOfWeek: "1", year: "2026" });
    expect(row.value).toBe("May 25, 2026");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ month: "", nth: "4", dayOfWeek: "4", year: "2026" });
    expect(row.value).toBe("—");
  });
});

describe("Occupied Hours per Year", () => {
  const c = calc("occupied-hours-per-year-calculator");

  it("8:00-17:00, 5 days/week -> 2340 hrs", () => {
    const [row] = c.compute({ start: "08:00", end: "17:00", days: "5" });
    expect(row.value).toBe("2340");
    expect(row.unit).toBe("hrs");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ start: "", end: "17:00", days: "5" });
    expect(row.value).toBe("—");
  });
});

describe("Trend Sample Rate", () => {
  const c = calc("trend-sample-rate-calculator");

  it("temperature -> 5-15 min recommendation", () => {
    const [row] = c.compute({ process: "temperature" });
    expect(row.value).toBe("5-15 min (slow thermal mass)");
  });

  it("unknown process -> —", () => {
    const [row] = c.compute({ process: "unknown" });
    expect(row.value).toBe("—");
  });
});
