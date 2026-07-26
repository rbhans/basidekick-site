import type { CalcSection } from "../types";
import { hasInvalidNumbers } from "../psychrometrics";

export const section03: CalcSection = {
  num: "03",
  title: "Network & integration",
  calculators: [
    {
      id: "bacnet-device-instance-calculator",
      title: "BACnet Device Instance",
      inputs: [
        { key: "building", kind: "number", label: "Building Number", default: "1" },
        { key: "floor", kind: "number", label: "Floor Number", default: "1" },
        { key: "device", kind: "number", label: "Device Number", default: "1" },
      ],
      compute: (v) => {
        const bldg = parseInt(v.building, 10);
        const floor = parseInt(v.floor, 10);
        const dev = parseInt(v.device, 10);
        if ([bldg, floor, dev].some(Number.isNaN)) {
          return [{ label: "Device Instance", value: "—" }];
        }
        const instance = bldg * 100000 + floor * 1000 + dev;
        return [{ label: "Device Instance", value: instance.toString() }];
      },
    },
    {
      id: "mstp-segment-check-calculator",
      title: "MS/TP Segment Check",
      note: "Quick RS-485 screen only. Cable type, transceiver loading, termination, and biasing still matter.",
      inputs: [
        { key: "length", kind: "number", label: "Segment Length", unit: "ft", default: "1200" },
        { key: "unitLoads", kind: "number", label: "Unit Loads", default: "16" },
      ],
      compute: (v) => {
        const length = parseFloat(v.length);
        const unitLoads = parseFloat(v.unitLoads);
        if (hasInvalidNumbers([length, unitLoads])) {
          return [
            { label: "Status", value: "—" },
            { label: "Typical Limit", value: "—" },
          ];
        }
        const lengthOk = length <= 4000;
        const loadOk = unitLoads <= 32;
        const status = lengthOk && loadOk ? "Within typical segment limits" : "Split segment or add repeater";
        return [
          { label: "Status", value: status },
          { label: "Typical Limit", value: "4000 ft / 32 unit loads" },
        ];
      },
    },
    {
      id: "trend-log-storage-calculator",
      title: "Trend Log Storage",
      note: "Assumes 20 bytes per sample before database/index overhead.",
      inputs: [
        { key: "points", kind: "number", label: "Number of Points", default: "100" },
        { key: "interval", kind: "number", label: "Sample Interval", unit: "min", default: "5" },
        { key: "retention", kind: "number", label: "Retention Period", unit: "days", default: "30" },
      ],
      compute: (v) => {
        const points = parseInt(v.points, 10);
        const interval = parseInt(v.interval, 10);
        const days = parseInt(v.retention, 10);
        if ([points, interval, days].some(Number.isNaN) || interval <= 0) {
          return [{ label: "Storage Required", value: "—", unit: "MB" }];
        }
        const samplesPerDay = (24 * 60) / interval;
        const totalSamples = points * samplesPerDay * days;
        const bytesPerSample = 20;
        const totalMB = (totalSamples * bytesPerSample) / (1024 * 1024);
        return [{ label: "Storage Required", value: totalMB.toFixed(1), unit: "MB" }];
      },
    },
    {
      id: "ip-subnet-calculator",
      title: "IP Subnet Calculator",
      note: "Useful for BAS VLAN planning; verify gateway, DHCP reservations, and vendor discovery needs.",
      inputs: [
        { key: "ip", kind: "text", label: "Network Address", default: "192.168.1.0" },
        { key: "mask", kind: "number", label: "CIDR Mask", unit: "bits", default: "24" },
      ],
      compute: (v) => {
        const mask = parseInt(v.mask, 10);
        if (Number.isNaN(mask) || mask < 0 || mask > 32) {
          return [
            { label: "Usable Hosts", value: "—" },
            { label: "Host Range", value: "—" },
          ];
        }
        const hosts = mask === 32 ? 1 : mask === 31 ? 2 : Math.pow(2, 32 - mask) - 2;
        const octets = v.ip.split(".").map(Number);
        if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) {
          return [
            { label: "Usable Hosts", value: "—" },
            { label: "Host Range", value: "—" },
          ];
        }
        const ipNum = octets.reduce((acc, oct, i) => acc + (oct << (24 - i * 8)), 0) >>> 0;
        const maskNum = mask === 0 ? 0 : (0xffffffff << (32 - mask)) >>> 0;
        const network = ipNum & maskNum;
        const broadcast = network | (~maskNum >>> 0);
        const toIp = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
        if (mask === 32) {
          return [
            { label: "Usable Hosts", value: hosts.toLocaleString() },
            { label: "Host Range", value: toIp(network) },
          ];
        }
        if (mask === 31) {
          return [
            { label: "Usable Hosts", value: hosts.toLocaleString() },
            { label: "Host Range", value: `${toIp(network)} - ${toIp(broadcast)}` },
          ];
        }
        return [
          { label: "Usable Hosts", value: hosts.toLocaleString() },
          { label: "Host Range", value: `${toIp(network + 1)} - ${toIp(broadcast - 1)}` },
        ];
      },
    },
  ],
};
