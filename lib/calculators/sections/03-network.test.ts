import { describe, expect, it } from "vitest";
import { section03 } from "./03-network";

function calc(id: string) {
  const found = section03.calculators.find((c) => c.id === id);
  if (!found) throw new Error(`calculator ${id} not found`);
  return found;
}

describe("BACnet Device Instance", () => {
  const c = calc("bacnet-device-instance-calculator");

  it("building=1, floor=1, device=1 -> 101001", () => {
    const [row] = c.compute({ building: "1", floor: "1", device: "1" });
    expect(row.value).toBe("101001");
  });

  it("returns — for blank input", () => {
    const [row] = c.compute({ building: "", floor: "1", device: "1" });
    expect(row.value).toBe("—");
  });
});

describe("MS/TP Segment Check", () => {
  const c = calc("mstp-segment-check-calculator");

  it("length=1200, unitLoads=16 -> within typical limits", () => {
    const [status, limit] = c.compute({ length: "1200", unitLoads: "16" });
    expect(status.value).toBe("Within typical segment limits");
    expect(limit.value).toBe("4000 ft / 32 unit loads");
  });

  it("length over 4000 ft -> split segment", () => {
    const [status] = c.compute({ length: "5000", unitLoads: "16" });
    expect(status.value).toBe("Split segment or add repeater");
  });

  it("returns — for blank input", () => {
    const [status, limit] = c.compute({ length: "", unitLoads: "16" });
    expect(status.value).toBe("—");
    expect(limit.value).toBe("—");
  });
});

describe("Trend Log Storage", () => {
  const c = calc("trend-log-storage-calculator");

  it("points=100, interval=5min, retention=30 days -> 16.5 MB", () => {
    const [row] = c.compute({ points: "100", interval: "5", retention: "30" });
    expect(row.value).toBe("16.5");
    expect(row.unit).toBe("MB");
  });

  it("returns — for zero interval", () => {
    const [row] = c.compute({ points: "100", interval: "0", retention: "30" });
    expect(row.value).toBe("—");
  });
});

describe("IP Subnet Calculator", () => {
  const c = calc("ip-subnet-calculator");

  it("192.168.1.0/24 -> 254 usable hosts, .1-.254 range", () => {
    const [hosts, range] = c.compute({ ip: "192.168.1.0", mask: "24" });
    expect(hosts.value).toBe("254");
    expect(range.value).toBe("192.168.1.1 - 192.168.1.254");
  });

  it("/31 point-to-point link -> 2 hosts, full range (no network/broadcast exclusion)", () => {
    const [hosts, range] = c.compute({ ip: "192.168.1.0", mask: "31" });
    expect(hosts.value).toBe("2");
    expect(range.value).toBe("192.168.1.0 - 192.168.1.1");
  });

  it("/32 host route -> 1 host, single address", () => {
    const [hosts, range] = c.compute({ ip: "192.168.1.5", mask: "32" });
    expect(hosts.value).toBe("1");
    expect(range.value).toBe("192.168.1.5");
  });

  it("returns — for invalid IP", () => {
    const [hosts, range] = c.compute({ ip: "192.168.1", mask: "24" });
    expect(hosts.value).toBe("—");
    expect(range.value).toBe("—");
  });
});
