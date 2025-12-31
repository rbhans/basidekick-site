"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CaretDown,
  ChartLine,
  Wind,
  Plugs,
  Drop,
  Lightning,
  Thermometer,
  Calendar,
  Wrench,
  Factory,
  Function,
  ArrowsClockwise,
} from "@phosphor-icons/react";

// Collapsible Section Component
function Section({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-card/80 border border-border transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>
        <CaretDown
          className={`size-5 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="mt-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-4 bg-card/50 border border-border border-t-0">
          {children}
        </div>
      )}
    </div>
  );
}

// Calculator Card
function Calculator({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border p-4 hover:border-primary/30 transition-colors">
      <h3 className="text-xs font-medium text-primary mb-3 uppercase tracking-wide">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// Input with Label and Unit
function CalcInput({
  label,
  value,
  onChange,
  unit,
  type = "number",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step="any"
          className="flex-1 font-mono"
        />
        {unit && (
          <span className="bg-muted border border-l-0 border-input px-2 py-1 text-xs text-muted-foreground min-w-[50px] text-center flex items-center justify-center">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// Output Display
function CalcOutput({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex">
        <div className="flex-1 bg-primary/10 border border-primary/30 px-2 py-1 text-primary text-sm font-mono min-h-[32px] flex items-center">
          {value || "—"}
        </div>
        {unit && (
          <span className="bg-primary/5 border border-l-0 border-primary/30 px-2 py-1 text-xs text-primary min-w-[50px] text-center flex items-center justify-center">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// Select Component
function CalcSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border border-input px-2 py-1 text-sm focus:outline-none focus:border-primary h-8"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CalculatorsView() {
  // Sensor & Signal Scaling
  const [analogRawMin, setAnalogRawMin] = useState("4");
  const [analogRawMax, setAnalogRawMax] = useState("20");
  const [analogEngMin, setAnalogEngMin] = useState("0");
  const [analogEngMax, setAnalogEngMax] = useState("100");
  const [analogRawValue, setAnalogRawValue] = useState("12");

  const analogScaled = (() => {
    const rawMin = parseFloat(analogRawMin),
      rawMax = parseFloat(analogRawMax);
    const engMin = parseFloat(analogEngMin),
      engMax = parseFloat(analogEngMax);
    const raw = parseFloat(analogRawValue);
    if ([rawMin, rawMax, engMin, engMax, raw].some(isNaN)) return "";
    const scaled = ((raw - rawMin) / (rawMax - rawMin)) * (engMax - engMin) + engMin;
    return scaled.toFixed(2);
  })();

  // Thermistor Calculator
  const [thermResistance, setThermResistance] = useState("10000");
  const [thermType, setThermType] = useState("10k-type2");

  const thermTemp = (() => {
    const r = parseFloat(thermResistance);
    if (isNaN(r)) return "";
    const a = 0.001129148,
      b = 0.000234125,
      c = 0.0000000876741;
    const lnR = Math.log(r);
    const tKelvin = 1 / (a + b * lnR + c * Math.pow(lnR, 3));
    const tCelsius = tKelvin - 273.15;
    const tFahrenheit = (tCelsius * 9) / 5 + 32;
    return `${tCelsius.toFixed(1)}°C / ${tFahrenheit.toFixed(1)}°F`;
  })();

  // Pressure with Elevation
  const [pressureRaw, setPressureRaw] = useState("14.7");
  const [elevation, setElevation] = useState("0");

  const pressureCorrected = (() => {
    const p = parseFloat(pressureRaw),
      elev = parseFloat(elevation);
    if (isNaN(p) || isNaN(elev)) return "";
    const correction = Math.exp(-elev / 27000);
    const corrected = p / correction;
    return corrected.toFixed(3);
  })();

  // ACH Calculator
  const [achCfm, setAchCfm] = useState("500");
  const [achLength, setAchLength] = useState("20");
  const [achWidth, setAchWidth] = useState("15");
  const [achHeight, setAchHeight] = useState("10");

  const achResult = (() => {
    const cfm = parseFloat(achCfm);
    const l = parseFloat(achLength),
      w = parseFloat(achWidth),
      h = parseFloat(achHeight);
    if ([cfm, l, w, h].some(isNaN)) return "";
    const volume = l * w * h;
    const ach = (cfm * 60) / volume;
    return ach.toFixed(2);
  })();

  // Mixed Air Temperature
  const [matOaTemp, setMatOaTemp] = useState("35");
  const [matRaTemp, setMatRaTemp] = useState("72");
  const [matOaDamper, setMatOaDamper] = useState("30");

  const matResult = (() => {
    const oa = parseFloat(matOaTemp),
      ra = parseFloat(matRaTemp),
      damper = parseFloat(matOaDamper);
    if ([oa, ra, damper].some(isNaN)) return "";
    const mat = oa * (damper / 100) + ra * (1 - damper / 100);
    return mat.toFixed(1);
  })();

  // Economizer Enthalpy
  const [econTemp, setEconTemp] = useState("70");
  const [econRh, setEconRh] = useState("50");

  const econEnthalpy = (() => {
    const t = parseFloat(econTemp),
      rh = parseFloat(econRh);
    if (isNaN(t) || isNaN(rh)) return "";
    const pws =
      Math.exp(77.345 + 0.0057 * (t + 459.67) - 7235 / (t + 459.67)) /
      Math.pow(t + 459.67, 8.2);
    const w = (0.62198 * (rh / 100) * pws) / (14.696 - (rh / 100) * pws);
    const h = 0.24 * t + w * (1061 + 0.444 * t);
    return h.toFixed(2);
  })();

  // Optimal Start
  const [optStartDeltaT, setOptStartDeltaT] = useState("10");
  const [optStartMass, setOptStartMass] = useState("medium");

  const optStartTime = (() => {
    const dt = parseFloat(optStartDeltaT);
    if (isNaN(dt)) return "";
    const factors: Record<string, number> = { light: 3, medium: 5, heavy: 8 };
    const time = dt * factors[optStartMass];
    return `${time} minutes`;
  })();

  // BACnet Device Instance
  const [bacnetBuilding, setBacnetBuilding] = useState("1");
  const [bacnetFloor, setBacnetFloor] = useState("1");
  const [bacnetDevice, setBacnetDevice] = useState("1");

  const bacnetInstance = (() => {
    const bldg = parseInt(bacnetBuilding),
      floor = parseInt(bacnetFloor),
      dev = parseInt(bacnetDevice);
    if ([bldg, floor, dev].some(isNaN)) return "";
    const instance = bldg * 100000 + floor * 1000 + dev;
    return instance.toString();
  })();

  // MS/TP Trunk Length
  const [mstpBaud, setMstpBaud] = useState("76800");
  const [mstpDevices, setMstpDevices] = useState("10");

  const mstpLength = (() => {
    const baud = parseInt(mstpBaud),
      devices = parseInt(mstpDevices);
    if (isNaN(baud) || isNaN(devices)) return "";
    const baseLengths: Record<number, number> = { 9600: 4000, 19200: 4000, 38400: 4000, 76800: 4000 };
    const maxLength = baseLengths[baud] || 4000;
    const derating = Math.max(0.5, 1 - (devices - 1) * 0.02);
    return `${Math.round(maxLength * derating)} ft max`;
  })();

  // Trend Log Storage
  const [trendPoints, setTrendPoints] = useState("100");
  const [trendInterval, setTrendInterval] = useState("5");
  const [trendRetention, setTrendRetention] = useState("30");

  const trendStorage = (() => {
    const points = parseInt(trendPoints),
      interval = parseInt(trendInterval),
      days = parseInt(trendRetention);
    if ([points, interval, days].some(isNaN)) return "";
    const samplesPerDay = (24 * 60) / interval;
    const totalSamples = points * samplesPerDay * days;
    const bytesPerSample = 20;
    const totalMB = (totalSamples * bytesPerSample) / (1024 * 1024);
    return totalMB.toFixed(1);
  })();

  // Pump Head
  const [pumpGpm, setPumpGpm] = useState("100");
  const [pumpLength, setPumpLength] = useState("200");
  const [pumpSize, setPumpSize] = useState("2");

  const pumpHead = (() => {
    const gpm = parseFloat(pumpGpm),
      length = parseFloat(pumpLength),
      size = parseFloat(pumpSize);
    if ([gpm, length, size].some(isNaN)) return "";
    const velocity = (gpm * 0.408) / (size * size);
    const frictionLoss = 0.2 * Math.pow(velocity, 1.85) * (length / 100);
    return frictionLoss.toFixed(1);
  })();

  // Glycol Heat Transfer
  const [glycolPercent, setGlycolPercent] = useState("30");

  const glycolEffect = (() => {
    const pct = parseFloat(glycolPercent);
    if (isNaN(pct)) return { capacity: "", flow: "" };
    const capacityLoss = pct * 0.5;
    const flowIncrease = pct * 0.3;
    return {
      capacity: `${(100 - capacityLoss).toFixed(0)}%`,
      flow: `+${flowIncrease.toFixed(0)}%`,
    };
  })();

  // Expansion Tank
  const [expVolume, setExpVolume] = useState("100");
  const [expDeltaT, setExpDeltaT] = useState("40");

  const expTankSize = (() => {
    const vol = parseFloat(expVolume),
      dt = parseFloat(expDeltaT);
    if (isNaN(vol) || isNaN(dt)) return "";
    const expansion = vol * (dt * 0.00012);
    const tankSize = expansion * 2.5;
    return tankSize.toFixed(1);
  })();

  // Cv Calculator
  const [cvFlow, setCvFlow] = useState("50");
  const [cvDeltaP, setCvDeltaP] = useState("4");
  const [cvSg, setCvSg] = useState("1.0");

  const cvResult = (() => {
    const flow = parseFloat(cvFlow),
      dp = parseFloat(cvDeltaP),
      sg = parseFloat(cvSg);
    if ([flow, dp, sg].some(isNaN) || dp === 0) return "";
    const cv = flow / Math.sqrt(dp / sg);
    return cv.toFixed(1);
  })();

  // 3-Phase Power
  const [powerVolts, setPowerVolts] = useState("480");
  const [powerAmps, setPowerAmps] = useState("50");
  const [powerPf, setPowerPf] = useState("0.85");

  const power3Phase = (() => {
    const v = parseFloat(powerVolts),
      a = parseFloat(powerAmps),
      pf = parseFloat(powerPf);
    if ([v, a, pf].some(isNaN)) return "";
    const kw = (v * a * Math.sqrt(3) * pf) / 1000;
    return kw.toFixed(2);
  })();

  // Transformer VA
  const [xfmrLoads, setXfmrLoads] = useState("20");
  const [xfmrVaEach, setXfmrVaEach] = useState("15");

  const xfmrSize = (() => {
    const loads = parseInt(xfmrLoads),
      va = parseFloat(xfmrVaEach);
    if (isNaN(loads) || isNaN(va)) return "";
    const total = loads * va * 1.25;
    const sizes = [50, 75, 100, 150, 200, 300, 500, 750, 1000];
    const recommended = sizes.find((s) => s >= total) || sizes[sizes.length - 1];
    return `${Math.ceil(total)} VA (use ${recommended} VA)`;
  })();

  // Wire Gauge
  const [wireLength, setWireLength] = useState("100");
  const [wireAmps, setWireAmps] = useState("2");

  const wireGauge = (() => {
    const len = parseFloat(wireLength),
      amps = parseFloat(wireAmps);
    if (isNaN(len) || isNaN(amps)) return "";
    const vDrop = 2 * len * amps * 0.00328;
    if (vDrop > 2.4) return "14 AWG (consider larger)";
    if (vDrop > 1.5) return "16 AWG";
    if (vDrop > 0.9) return "18 AWG";
    return "20 AWG";
  })();

  // UPS Runtime
  const [upsVa, setUpsVa] = useState("1500");
  const [upsLoad, setUpsLoad] = useState("500");

  const upsRuntime = (() => {
    const va = parseFloat(upsVa),
      load = parseFloat(upsLoad);
    if (isNaN(va) || isNaN(load) || load === 0) return "";
    const runtime = (va / load) * 5;
    return `~${Math.round(runtime)} minutes`;
  })();

  // Dew Point
  const [dpTemp, setDpTemp] = useState("72");
  const [dpRh, setDpRh] = useState("50");

  const dewPoint = (() => {
    const t = parseFloat(dpTemp),
      rh = parseFloat(dpRh);
    if (isNaN(t) || isNaN(rh)) return "";
    const tc = ((t - 32) * 5) / 9;
    const a = 17.27,
      b = 237.7;
    const alpha = (a * tc) / (b + tc) + Math.log(rh / 100);
    const dpC = (b * alpha) / (a - alpha);
    const dpF = (dpC * 9) / 5 + 32;
    return `${dpF.toFixed(1)}°F / ${dpC.toFixed(1)}°C`;
  })();

  // Enthalpy
  const [enthalpyTemp, setEnthalpyTemp] = useState("75");
  const [enthalpyRh, setEnthalpyRh] = useState("50");

  const enthalpyResult = (() => {
    const t = parseFloat(enthalpyTemp),
      rh = parseFloat(enthalpyRh);
    if (isNaN(t) || isNaN(rh)) return "";
    const pws =
      Math.exp(77.345 + 0.0057 * (t + 459.67) - 7235 / (t + 459.67)) /
      Math.pow(t + 459.67, 8.2);
    const w = (0.62198 * (rh / 100) * pws) / (14.696 - (rh / 100) * pws);
    const h = 0.24 * t + w * (1061 + 0.444 * t);
    return h.toFixed(2);
  })();

  // Wet Bulb
  const [wbTemp, setWbTemp] = useState("80");
  const [wbRh, setWbRh] = useState("60");

  const wetBulb = (() => {
    const t = parseFloat(wbTemp),
      rh = parseFloat(wbRh);
    if (isNaN(t) || isNaN(rh)) return "";
    const tc = ((t - 32) * 5) / 9;
    const wb =
      tc * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
      Math.atan(tc + rh) -
      Math.atan(rh - 1.676331) +
      0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
      4.686035;
    const wbF = (wb * 9) / 5 + 32;
    return `${wbF.toFixed(1)}°F / ${wb.toFixed(1)}°C`;
  })();

  // Humidity Ratio
  const [hrTemp, setHrTemp] = useState("75");
  const [hrRh, setHrRh] = useState("50");

  const humidityRatio = (() => {
    const t = parseFloat(hrTemp),
      rh = parseFloat(hrRh);
    if (isNaN(t) || isNaN(rh)) return { grains: "", lbm: "" };
    const pws =
      Math.exp(77.345 + 0.0057 * (t + 459.67) - 7235 / (t + 459.67)) /
      Math.pow(t + 459.67, 8.2);
    const w = (0.62198 * (rh / 100) * pws) / (14.696 - (rh / 100) * pws);
    const grains = w * 7000;
    return { grains: grains.toFixed(1), lbm: (w * 1000).toFixed(3) };
  })();

  // Optimal Stop
  const [osCoastTime, setOsCoastTime] = useState("30");
  const [osOccEnd, setOsOccEnd] = useState("17:00");

  const optStopTime = (() => {
    const coast = parseInt(osCoastTime);
    if (isNaN(coast) || !osOccEnd) return "";
    const [h, m] = osOccEnd.split(":").map(Number);
    let stopM = h * 60 + m - coast;
    if (stopM < 0) stopM += 24 * 60;
    const stopH = Math.floor(stopM / 60);
    const stopMin = stopM % 60;
    return `${stopH.toString().padStart(2, "0")}:${stopMin.toString().padStart(2, "0")}`;
  })();

  // Holiday Calculator
  const [holidayMonth, setHolidayMonth] = useState("11");
  const [holidayNth, setHolidayNth] = useState("4");
  const [holidayDay, setHolidayDay] = useState("4");
  const [holidayYear, setHolidayYear] = useState("2025");

  const holidayDate = (() => {
    const month = parseInt(holidayMonth),
      nth = parseInt(holidayNth);
    const dayOfWeek = parseInt(holidayDay),
      year = parseInt(holidayYear);
    if ([month, nth, dayOfWeek, year].some(isNaN)) return "";
    let count = 0;
    for (let d = 1; d <= 31; d++) {
      const date = new Date(year, month - 1, d);
      if (date.getMonth() !== month - 1) break;
      if (date.getDay() === dayOfWeek) {
        count++;
        if (count === nth) {
          return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
      }
    }
    return "Invalid";
  })();

  // Occupied Hours
  const [occStart, setOccStart] = useState("07:00");
  const [occEnd, setOccEnd] = useState("18:00");
  const [occDays, setOccDays] = useState("5");

  const occHoursYear = (() => {
    if (!occStart || !occEnd) return "";
    const [sh, sm] = occStart.split(":").map(Number);
    const [eh, em] = occEnd.split(":").map(Number);
    const days = parseInt(occDays);
    if (isNaN(days)) return "";
    const hoursPerDay = (eh * 60 + em - sh * 60 - sm) / 60;
    const weeksPerYear = 52;
    const total = hoursPerDay * days * weeksPerYear;
    return total.toFixed(0);
  })();

  // Sensor Drift
  const [driftExpected, setDriftExpected] = useState("72");
  const [driftActual, setDriftActual] = useState("73.5");
  const [driftTolerance, setDriftTolerance] = useState("1");

  const driftStatus = (() => {
    const exp = parseFloat(driftExpected),
      act = parseFloat(driftActual),
      tol = parseFloat(driftTolerance);
    if ([exp, act, tol].some(isNaN)) return { diff: "", status: "" };
    const diff = act - exp;
    const status = Math.abs(diff) <= tol ? "Within tolerance" : "Exceeds tolerance";
    return { diff: diff.toFixed(2), status };
  })();

  // Actuator Stroke Time
  const [actTravel, setActTravel] = useState("90");
  const [actSpeed, setActSpeed] = useState("30");

  const strokeTime = (() => {
    const travel = parseFloat(actTravel),
      speed = parseFloat(actSpeed);
    if (isNaN(travel) || isNaN(speed) || speed === 0) return "";
    const time = travel / speed;
    return `${time.toFixed(0)} seconds`;
  })();

  // Duct Static Setpoint
  const [ductDesignCfm, setDuctDesignCfm] = useState("10000");
  const [ductDesignSp, setDuctDesignSp] = useState("2.5");
  const [ductActualCfm, setDuctActualCfm] = useState("7500");

  const ductSpSetpoint = (() => {
    const designCfm = parseFloat(ductDesignCfm),
      designSp = parseFloat(ductDesignSp);
    const actualCfm = parseFloat(ductActualCfm);
    if ([designCfm, designSp, actualCfm].some(isNaN) || designCfm === 0) return "";
    const newSp = designSp * Math.pow(actualCfm / designCfm, 2);
    return newSp.toFixed(2);
  })();

  // BTU Calculator
  const [btuGpm, setBtuGpm] = useState("50");
  const [btuDeltaT, setBtuDeltaT] = useState("10");

  const btuResult = (() => {
    const gpm = parseFloat(btuGpm),
      dt = parseFloat(btuDeltaT);
    if (isNaN(gpm) || isNaN(dt)) return { btu: "", tons: "" };
    const btu = gpm * dt * 500;
    const tons = btu / 12000;
    return { btu: btu.toLocaleString(), tons: tons.toFixed(2) };
  })();

  // Chiller kW/ton
  const [chillerKw, setChillerKw] = useState("100");
  const [chillerTons, setChillerTons] = useState("150");

  const chillerEfficiency = (() => {
    const kw = parseFloat(chillerKw),
      tons = parseFloat(chillerTons);
    if (isNaN(kw) || isNaN(tons) || tons === 0) return "";
    return (kw / tons).toFixed(3);
  })();

  // VFD Savings
  const [vfdSpeedReduction, setVfdSpeedReduction] = useState("20");
  const [vfdMotorHp, setVfdMotorHp] = useState("50");
  const [vfdHoursYear, setVfdHoursYear] = useState("4000");
  const [vfdKwhCost, setVfdKwhCost] = useState("0.10");

  const vfdSavings = (() => {
    const reduction = parseFloat(vfdSpeedReduction),
      hp = parseFloat(vfdMotorHp);
    const hours = parseFloat(vfdHoursYear),
      cost = parseFloat(vfdKwhCost);
    if ([reduction, hp, hours, cost].some(isNaN)) return { kwh: "", dollars: "" };
    const fullKw = hp * 0.746;
    const reducedKw = fullKw * Math.pow(1 - reduction / 100, 3);
    const savedKw = fullKw - reducedKw;
    const savedKwh = savedKw * hours;
    const savedDollars = savedKwh * cost;
    return {
      kwh: savedKwh.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      dollars: savedDollars.toLocaleString(undefined, { style: "currency", currency: "USD" }),
    };
  })();

  // Cooling Tower
  const [ctEntering, setCtEntering] = useState("95");
  const [ctLeaving, setCtLeaving] = useState("85");
  const [ctWetBulb, setCtWetBulb] = useState("78");

  const ctResults = (() => {
    const entering = parseFloat(ctEntering),
      leaving = parseFloat(ctLeaving),
      wb = parseFloat(ctWetBulb);
    if ([entering, leaving, wb].some(isNaN)) return { range: "", approach: "" };
    return {
      range: (entering - leaving).toFixed(1),
      approach: (leaving - wb).toFixed(1),
    };
  })();

  // PID Tuning (Ziegler-Nichols)
  const [pidKu, setPidKu] = useState("2");
  const [pidTu, setPidTu] = useState("60");

  const pidParams = (() => {
    const ku = parseFloat(pidKu),
      tu = parseFloat(pidTu);
    if (isNaN(ku) || isNaN(tu)) return { kp: "", ki: "", kd: "" };
    return {
      kp: (0.6 * ku).toFixed(3),
      ki: ((1.2 * ku) / tu).toFixed(4),
      kd: (0.075 * ku * tu).toFixed(2),
    };
  })();

  // Reset Schedule
  const [resetOatMin, setResetOatMin] = useState("0");
  const [resetOatMax, setResetOatMax] = useState("70");
  const [resetSpMin, setResetSpMin] = useState("180");
  const [resetSpMax, setResetSpMax] = useState("140");
  const [resetOatCurrent, setResetOatCurrent] = useState("35");

  const resetSetpoint = (() => {
    const oatMin = parseFloat(resetOatMin),
      oatMax = parseFloat(resetOatMax);
    const spMin = parseFloat(resetSpMin),
      spMax = parseFloat(resetSpMax);
    const oat = parseFloat(resetOatCurrent);
    if ([oatMin, oatMax, spMin, spMax, oat].some(isNaN)) return "";
    const ratio = Math.max(0, Math.min(1, (oat - oatMin) / (oatMax - oatMin)));
    const sp = spMin + ratio * (spMax - spMin);
    return sp.toFixed(1);
  })();

  // Pressure Conversions
  const [pressureValue, setPressureValue] = useState("1");
  const [pressureUnit, setPressureUnit] = useState("iwc");

  const pressureConversions = (() => {
    const val = parseFloat(pressureValue);
    if (isNaN(val)) return { iwc: "", pa: "", psi: "", kpa: "" };
    let iwc;
    switch (pressureUnit) {
      case "iwc":
        iwc = val;
        break;
      case "pa":
        iwc = val / 249.09;
        break;
      case "psi":
        iwc = val * 27.68;
        break;
      case "kpa":
        iwc = val * 4.0147;
        break;
      default:
        iwc = val;
    }
    return {
      iwc: iwc.toFixed(3),
      pa: (iwc * 249.09).toFixed(2),
      psi: (iwc / 27.68).toFixed(4),
      kpa: (iwc / 4.0147).toFixed(4),
    };
  })();

  // Flow Conversions
  const [flowValue, setFlowValue] = useState("1000");
  const [flowUnit, setFlowUnit] = useState("cfm");

  const flowConversions = (() => {
    const val = parseFloat(flowValue);
    if (isNaN(val)) return { cfm: "", ls: "", m3h: "" };
    let cfm;
    switch (flowUnit) {
      case "cfm":
        cfm = val;
        break;
      case "ls":
        cfm = val * 2.119;
        break;
      case "m3h":
        cfm = val * 0.5886;
        break;
      default:
        cfm = val;
    }
    return {
      cfm: cfm.toFixed(1),
      ls: (cfm / 2.119).toFixed(2),
      m3h: (cfm / 0.5886).toFixed(1),
    };
  })();

  // Temperature Conversions
  const [tempValue, setTempValue] = useState("72");
  const [tempUnit, setTempUnit] = useState("f");

  const tempConversions = (() => {
    const val = parseFloat(tempValue);
    if (isNaN(val)) return { f: "", c: "", k: "" };
    let f;
    switch (tempUnit) {
      case "f":
        f = val;
        break;
      case "c":
        f = (val * 9) / 5 + 32;
        break;
      case "k":
        f = ((val - 273.15) * 9) / 5 + 32;
        break;
      default:
        f = val;
    }
    return {
      f: f.toFixed(2),
      c: (((f - 32) * 5) / 9).toFixed(2),
      k: ((((f - 32) * 5) / 9) + 273.15).toFixed(2),
    };
  })();

  // IP Subnet Calculator
  const [subnetIp, setSubnetIp] = useState("192.168.1.0");
  const [subnetMask, setSubnetMask] = useState("24");

  const subnetInfo = (() => {
    const mask = parseInt(subnetMask);
    if (isNaN(mask) || mask < 0 || mask > 32) return { hosts: "", range: "" };
    const hosts = Math.pow(2, 32 - mask) - 2;
    const octets = subnetIp.split(".").map(Number);
    if (octets.length !== 4 || octets.some(isNaN)) return { hosts: "", range: "" };
    const ipNum = octets.reduce((acc, oct, i) => acc + (oct << (24 - i * 8)), 0) >>> 0;
    const maskNum = (0xffffffff << (32 - mask)) >>> 0;
    const network = ipNum & maskNum;
    const broadcast = network | (~maskNum >>> 0);
    const toIp = (n: number) =>
      [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
    return {
      hosts: hosts.toLocaleString(),
      range: `${toIp(network + 1)} - ${toIp(broadcast - 1)}`,
    };
  })();

  // Trend Sample Rate
  const [trendProcess, setTrendProcess] = useState("temperature");

  const trendRecommendation = (() => {
    const recommendations: Record<string, string> = {
      temperature: "5-15 min (slow thermal mass)",
      pressure: "1-5 min (moderate dynamics)",
      flow: "1-5 min (moderate dynamics)",
      status: "1 min or COV (binary states)",
      power: "15 min (energy totalization)",
      humidity: "5-15 min (slow response)",
    };
    return recommendations[trendProcess] || "";
  })();

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>resources</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            BAS Calculators
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Quick reference calculators for building automation professionals. For estimation
            purposes—verify critical calculations.
          </p>
        </div>
      </section>

      {/* Calculators */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Sensor & Signal Scaling */}
          <Section title="Sensor & Signal Scaling" icon={<ChartLine className="size-5" />} defaultOpen>
            <Calculator title="Analog Input Scaling">
              <div className="grid grid-cols-2 gap-2">
                <CalcInput label="Raw Min" value={analogRawMin} onChange={setAnalogRawMin} unit="mA/V" />
                <CalcInput label="Raw Max" value={analogRawMax} onChange={setAnalogRawMax} unit="mA/V" />
                <CalcInput label="Eng Min" value={analogEngMin} onChange={setAnalogEngMin} />
                <CalcInput label="Eng Max" value={analogEngMax} onChange={setAnalogEngMax} />
              </div>
              <CalcInput label="Raw Input Value" value={analogRawValue} onChange={setAnalogRawValue} unit="mA/V" />
              <CalcOutput label="Scaled Output" value={analogScaled} unit="eng" />
            </Calculator>

            <Calculator title="Thermistor Temperature">
              <CalcSelect
                label="Thermistor Type"
                value={thermType}
                onChange={setThermType}
                options={[
                  { value: "10k-type2", label: "10K Type II" },
                  { value: "10k-type3", label: "10K Type III" },
                  { value: "3k", label: "3K NTC" },
                ]}
              />
              <CalcInput label="Resistance" value={thermResistance} onChange={setThermResistance} unit="Ω" />
              <CalcOutput label="Temperature" value={thermTemp} />
            </Calculator>

            <Calculator title="Pressure with Elevation">
              <CalcInput label="Measured Pressure" value={pressureRaw} onChange={setPressureRaw} unit="PSI" />
              <CalcInput label="Elevation" value={elevation} onChange={setElevation} unit="ft" />
              <CalcOutput label="Corrected (sea level)" value={pressureCorrected} unit="PSI" />
            </Calculator>
          </Section>

          {/* Airside Calculations */}
          <Section title="Airside Calculations" icon={<Wind className="size-5" />}>
            <Calculator title="Air Changes per Hour">
              <CalcInput label="Airflow" value={achCfm} onChange={setAchCfm} unit="CFM" />
              <div className="grid grid-cols-3 gap-2">
                <CalcInput label="Length" value={achLength} onChange={setAchLength} unit="ft" />
                <CalcInput label="Width" value={achWidth} onChange={setAchWidth} unit="ft" />
                <CalcInput label="Height" value={achHeight} onChange={setAchHeight} unit="ft" />
              </div>
              <CalcOutput label="Air Changes/Hour" value={achResult} unit="ACH" />
            </Calculator>

            <Calculator title="Mixed Air Temperature">
              <CalcInput label="Outside Air Temp" value={matOaTemp} onChange={setMatOaTemp} unit="°F" />
              <CalcInput label="Return Air Temp" value={matRaTemp} onChange={setMatRaTemp} unit="°F" />
              <CalcInput label="OA Damper Position" value={matOaDamper} onChange={setMatOaDamper} unit="%" />
              <CalcOutput label="Mixed Air Temp" value={matResult} unit="°F" />
            </Calculator>

            <Calculator title="Economizer Enthalpy">
              <CalcInput label="Dry Bulb Temp" value={econTemp} onChange={setEconTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={econRh} onChange={setEconRh} unit="%" />
              <CalcOutput label="Enthalpy" value={econEnthalpy} unit="BTU/lb" />
            </Calculator>

            <Calculator title="Optimal Start Time">
              <CalcInput label="Temperature Delta" value={optStartDeltaT} onChange={setOptStartDeltaT} unit="°F" />
              <CalcSelect
                label="Building Thermal Mass"
                value={optStartMass}
                onChange={setOptStartMass}
                options={[
                  { value: "light", label: "Light (modular, open)" },
                  { value: "medium", label: "Medium (typical office)" },
                  { value: "heavy", label: "Heavy (masonry, concrete)" },
                ]}
              />
              <CalcOutput label="Start Before Occupancy" value={optStartTime} />
            </Calculator>
          </Section>

          {/* Network & Integration */}
          <Section title="Network & Integration" icon={<Plugs className="size-5" />}>
            <Calculator title="BACnet Device Instance">
              <CalcInput label="Building Number" value={bacnetBuilding} onChange={setBacnetBuilding} />
              <CalcInput label="Floor Number" value={bacnetFloor} onChange={setBacnetFloor} />
              <CalcInput label="Device Number" value={bacnetDevice} onChange={setBacnetDevice} />
              <CalcOutput label="Device Instance" value={bacnetInstance} />
            </Calculator>

            <Calculator title="MS/TP Trunk Length">
              <CalcSelect
                label="Baud Rate"
                value={mstpBaud}
                onChange={setMstpBaud}
                options={[
                  { value: "9600", label: "9600" },
                  { value: "19200", label: "19200" },
                  { value: "38400", label: "38400" },
                  { value: "76800", label: "76800" },
                ]}
              />
              <CalcInput label="Device Count" value={mstpDevices} onChange={setMstpDevices} />
              <CalcOutput label="Max Trunk Length" value={mstpLength} />
            </Calculator>

            <Calculator title="Trend Log Storage">
              <CalcInput label="Number of Points" value={trendPoints} onChange={setTrendPoints} />
              <CalcInput label="Sample Interval" value={trendInterval} onChange={setTrendInterval} unit="min" />
              <CalcInput label="Retention Period" value={trendRetention} onChange={setTrendRetention} unit="days" />
              <CalcOutput label="Storage Required" value={trendStorage} unit="MB" />
            </Calculator>

            <Calculator title="IP Subnet Calculator">
              <CalcInput label="Network Address" value={subnetIp} onChange={setSubnetIp} type="text" />
              <CalcInput label="CIDR Mask" value={subnetMask} onChange={setSubnetMask} unit="bits" />
              <CalcOutput label="Usable Hosts" value={subnetInfo.hosts} />
              <CalcOutput label="Host Range" value={subnetInfo.range} />
            </Calculator>
          </Section>

          {/* Hydronic Systems */}
          <Section title="Hydronic Systems" icon={<Drop className="size-5" />}>
            <Calculator title="Pump Head Pressure">
              <CalcInput label="Flow Rate" value={pumpGpm} onChange={setPumpGpm} unit="GPM" />
              <CalcInput label="Pipe Run Length" value={pumpLength} onChange={setPumpLength} unit="ft" />
              <CalcInput label="Pipe Diameter" value={pumpSize} onChange={setPumpSize} unit="in" />
              <CalcOutput label="Friction Loss" value={pumpHead} unit="ft H₂O" />
            </Calculator>

            <Calculator title="Glycol Effects">
              <CalcInput label="Glycol Concentration" value={glycolPercent} onChange={setGlycolPercent} unit="%" />
              <CalcOutput label="Heat Transfer Capacity" value={glycolEffect.capacity} />
              <CalcOutput label="Required Flow Increase" value={glycolEffect.flow} />
            </Calculator>

            <Calculator title="Expansion Tank Sizing">
              <CalcInput label="System Volume" value={expVolume} onChange={setExpVolume} unit="gal" />
              <CalcInput label="Temperature Rise" value={expDeltaT} onChange={setExpDeltaT} unit="°F" />
              <CalcOutput label="Minimum Tank Size" value={expTankSize} unit="gal" />
            </Calculator>

            <Calculator title="Valve Cv Calculator">
              <CalcInput label="Flow Rate" value={cvFlow} onChange={setCvFlow} unit="GPM" />
              <CalcInput label="Pressure Drop" value={cvDeltaP} onChange={setCvDeltaP} unit="PSI" />
              <CalcInput label="Specific Gravity" value={cvSg} onChange={setCvSg} />
              <CalcOutput label="Required Cv" value={cvResult} />
            </Calculator>

            <Calculator title="BTU from Flow">
              <CalcInput label="Flow Rate" value={btuGpm} onChange={setBtuGpm} unit="GPM" />
              <CalcInput label="Temperature Difference" value={btuDeltaT} onChange={setBtuDeltaT} unit="°F" />
              <CalcOutput label="Heat Transfer" value={btuResult.btu} unit="BTU/hr" />
              <CalcOutput label="Cooling Tons" value={btuResult.tons} unit="tons" />
            </Calculator>
          </Section>

          {/* Electrical & Power */}
          <Section title="Electrical & Power" icon={<Lightning className="size-5" />}>
            <Calculator title="3-Phase Power">
              <CalcInput label="Voltage" value={powerVolts} onChange={setPowerVolts} unit="V" />
              <CalcInput label="Current" value={powerAmps} onChange={setPowerAmps} unit="A" />
              <CalcInput label="Power Factor" value={powerPf} onChange={setPowerPf} />
              <CalcOutput label="Power" value={power3Phase} unit="kW" />
            </Calculator>

            <Calculator title="Transformer Sizing">
              <CalcInput label="Number of Loads" value={xfmrLoads} onChange={setXfmrLoads} />
              <CalcInput label="VA per Load" value={xfmrVaEach} onChange={setXfmrVaEach} unit="VA" />
              <CalcOutput label="Recommended Size" value={xfmrSize} />
            </Calculator>

            <Calculator title="24VAC Wire Gauge">
              <CalcInput label="One-Way Distance" value={wireLength} onChange={setWireLength} unit="ft" />
              <CalcInput label="Load Current" value={wireAmps} onChange={setWireAmps} unit="A" />
              <CalcOutput label="Recommended Gauge" value={wireGauge} />
            </Calculator>

            <Calculator title="UPS Runtime">
              <CalcInput label="UPS Capacity" value={upsVa} onChange={setUpsVa} unit="VA" />
              <CalcInput label="Connected Load" value={upsLoad} onChange={setUpsLoad} unit="VA" />
              <CalcOutput label="Estimated Runtime" value={upsRuntime} />
            </Calculator>
          </Section>

          {/* Psychrometrics */}
          <Section title="Psychrometrics" icon={<Thermometer className="size-5" />}>
            <Calculator title="Dew Point">
              <CalcInput label="Dry Bulb Temp" value={dpTemp} onChange={setDpTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={dpRh} onChange={setDpRh} unit="%" />
              <CalcOutput label="Dew Point" value={dewPoint} />
            </Calculator>

            <Calculator title="Enthalpy">
              <CalcInput label="Dry Bulb Temp" value={enthalpyTemp} onChange={setEnthalpyTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={enthalpyRh} onChange={setEnthalpyRh} unit="%" />
              <CalcOutput label="Enthalpy" value={enthalpyResult} unit="BTU/lb" />
            </Calculator>

            <Calculator title="Wet Bulb Temperature">
              <CalcInput label="Dry Bulb Temp" value={wbTemp} onChange={setWbTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={wbRh} onChange={setWbRh} unit="%" />
              <CalcOutput label="Wet Bulb" value={wetBulb} />
            </Calculator>

            <Calculator title="Humidity Ratio">
              <CalcInput label="Dry Bulb Temp" value={hrTemp} onChange={setHrTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={hrRh} onChange={setHrRh} unit="%" />
              <CalcOutput label="Grains/lb dry air" value={humidityRatio.grains} unit="gr/lb" />
              <CalcOutput label="lb moisture/1000 lb air" value={humidityRatio.lbm} />
            </Calculator>
          </Section>

          {/* Scheduling & Time */}
          <Section title="Scheduling & Time" icon={<Calendar className="size-5" />}>
            <Calculator title="Optimal Stop Time">
              <CalcInput label="Coast Time" value={osCoastTime} onChange={setOsCoastTime} unit="min" />
              <CalcInput label="Occupancy End" value={osOccEnd} onChange={setOsOccEnd} type="time" />
              <CalcOutput label="Equipment Stop Time" value={optStopTime} />
            </Calculator>

            <Calculator title="Holiday Date (nth Weekday)">
              <div className="grid grid-cols-2 gap-2">
                <CalcSelect
                  label="Month"
                  value={holidayMonth}
                  onChange={setHolidayMonth}
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: String(i + 1),
                    label: new Date(2024, i).toLocaleString("default", { month: "long" }),
                  }))}
                />
                <CalcSelect
                  label="Which"
                  value={holidayNth}
                  onChange={setHolidayNth}
                  options={[
                    { value: "1", label: "1st" },
                    { value: "2", label: "2nd" },
                    { value: "3", label: "3rd" },
                    { value: "4", label: "4th" },
                  ]}
                />
                <CalcSelect
                  label="Day of Week"
                  value={holidayDay}
                  onChange={setHolidayDay}
                  options={[
                    { value: "0", label: "Sunday" },
                    { value: "1", label: "Monday" },
                    { value: "2", label: "Tuesday" },
                    { value: "3", label: "Wednesday" },
                    { value: "4", label: "Thursday" },
                    { value: "5", label: "Friday" },
                    { value: "6", label: "Saturday" },
                  ]}
                />
                <CalcInput label="Year" value={holidayYear} onChange={setHolidayYear} />
              </div>
              <CalcOutput label="Date" value={holidayDate} />
            </Calculator>

            <Calculator title="Occupied Hours per Year">
              <div className="grid grid-cols-2 gap-2">
                <CalcInput label="Start Time" value={occStart} onChange={setOccStart} type="time" />
                <CalcInput label="End Time" value={occEnd} onChange={setOccEnd} type="time" />
              </div>
              <CalcInput label="Days per Week" value={occDays} onChange={setOccDays} />
              <CalcOutput label="Hours per Year" value={occHoursYear} unit="hrs" />
            </Calculator>

            <Calculator title="Trend Sample Rate">
              <CalcSelect
                label="Process Type"
                value={trendProcess}
                onChange={setTrendProcess}
                options={[
                  { value: "temperature", label: "Temperature" },
                  { value: "pressure", label: "Pressure" },
                  { value: "flow", label: "Flow" },
                  { value: "status", label: "Binary Status" },
                  { value: "power", label: "Power/Energy" },
                  { value: "humidity", label: "Humidity" },
                ]}
              />
              <CalcOutput label="Recommended Interval" value={trendRecommendation} />
            </Calculator>
          </Section>

          {/* Commissioning & Troubleshooting */}
          <Section title="Commissioning & Troubleshooting" icon={<Wrench className="size-5" />}>
            <Calculator title="Sensor Drift Check">
              <CalcInput label="Expected Value" value={driftExpected} onChange={setDriftExpected} />
              <CalcInput label="Actual Reading" value={driftActual} onChange={setDriftActual} />
              <CalcInput label="Tolerance" value={driftTolerance} onChange={setDriftTolerance} unit="±" />
              <CalcOutput label="Deviation" value={driftStatus.diff} />
              <CalcOutput label="Status" value={driftStatus.status} />
            </Calculator>

            <Calculator title="Actuator Stroke Time">
              <CalcInput label="Travel (degrees or %)" value={actTravel} onChange={setActTravel} />
              <CalcInput label="Speed (per second)" value={actSpeed} onChange={setActSpeed} unit="/sec" />
              <CalcOutput label="Full Stroke Time" value={strokeTime} />
            </Calculator>

            <Calculator title="Duct Static Setpoint">
              <CalcInput label="Design CFM" value={ductDesignCfm} onChange={setDuctDesignCfm} unit="CFM" />
              <CalcInput label="Design Static" value={ductDesignSp} onChange={setDuctDesignSp} unit="in WC" />
              <CalcInput label="Actual CFM" value={ductActualCfm} onChange={setDuctActualCfm} unit="CFM" />
              <CalcOutput label="Adjusted Setpoint" value={ductSpSetpoint} unit="in WC" />
            </Calculator>
          </Section>

          {/* Energy & Equipment */}
          <Section title="Energy & Equipment" icon={<Factory className="size-5" />}>
            <Calculator title="Chiller Efficiency">
              <CalcInput label="Power Input" value={chillerKw} onChange={setChillerKw} unit="kW" />
              <CalcInput label="Cooling Output" value={chillerTons} onChange={setChillerTons} unit="tons" />
              <CalcOutput label="Efficiency" value={chillerEfficiency} unit="kW/ton" />
            </Calculator>

            <Calculator title="VFD Energy Savings">
              <CalcInput label="Speed Reduction" value={vfdSpeedReduction} onChange={setVfdSpeedReduction} unit="%" />
              <CalcInput label="Motor Size" value={vfdMotorHp} onChange={setVfdMotorHp} unit="HP" />
              <CalcInput label="Operating Hours" value={vfdHoursYear} onChange={setVfdHoursYear} unit="hrs/yr" />
              <CalcInput label="Electricity Cost" value={vfdKwhCost} onChange={setVfdKwhCost} unit="$/kWh" />
              <CalcOutput label="Annual kWh Saved" value={vfdSavings.kwh} unit="kWh" />
              <CalcOutput label="Annual Savings" value={vfdSavings.dollars} />
            </Calculator>

            <Calculator title="Cooling Tower Performance">
              <CalcInput label="Entering Water Temp" value={ctEntering} onChange={setCtEntering} unit="°F" />
              <CalcInput label="Leaving Water Temp" value={ctLeaving} onChange={setCtLeaving} unit="°F" />
              <CalcInput label="Wet Bulb Temp" value={ctWetBulb} onChange={setCtWetBulb} unit="°F" />
              <CalcOutput label="Range" value={ctResults.range} unit="°F" />
              <CalcOutput label="Approach" value={ctResults.approach} unit="°F" />
            </Calculator>
          </Section>

          {/* Controls Math */}
          <Section title="Controls Math" icon={<Function className="size-5" />}>
            <Calculator title="PID Tuning (Ziegler-Nichols)">
              <CalcInput label="Ultimate Gain (Ku)" value={pidKu} onChange={setPidKu} />
              <CalcInput label="Ultimate Period (Tu)" value={pidTu} onChange={setPidTu} unit="sec" />
              <CalcOutput label="Kp (Proportional)" value={pidParams.kp} />
              <CalcOutput label="Ki (Integral)" value={pidParams.ki} />
              <CalcOutput label="Kd (Derivative)" value={pidParams.kd} />
            </Calculator>

            <Calculator title="OAT Reset Schedule">
              <div className="grid grid-cols-2 gap-2">
                <CalcInput label="OAT Min" value={resetOatMin} onChange={setResetOatMin} unit="°F" />
                <CalcInput label="OAT Max" value={resetOatMax} onChange={setResetOatMax} unit="°F" />
                <CalcInput label="SP at Min OAT" value={resetSpMin} onChange={setResetSpMin} unit="°F" />
                <CalcInput label="SP at Max OAT" value={resetSpMax} onChange={setResetSpMax} unit="°F" />
              </div>
              <CalcInput label="Current OAT" value={resetOatCurrent} onChange={setResetOatCurrent} unit="°F" />
              <CalcOutput label="Calculated Setpoint" value={resetSetpoint} unit="°F" />
            </Calculator>
          </Section>

          {/* Unit Conversions */}
          <Section title="Unit Conversions" icon={<ArrowsClockwise className="size-5" />}>
            <Calculator title="Pressure">
              <div className="flex gap-2">
                <div className="flex-1">
                  <CalcInput label="Value" value={pressureValue} onChange={setPressureValue} />
                </div>
                <div className="w-24">
                  <CalcSelect
                    label="Unit"
                    value={pressureUnit}
                    onChange={setPressureUnit}
                    options={[
                      { value: "iwc", label: "in WC" },
                      { value: "pa", label: "Pa" },
                      { value: "psi", label: "PSI" },
                      { value: "kpa", label: "kPa" },
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <CalcOutput label="in WC" value={pressureConversions.iwc} />
                <CalcOutput label="Pa" value={pressureConversions.pa} />
                <CalcOutput label="PSI" value={pressureConversions.psi} />
                <CalcOutput label="kPa" value={pressureConversions.kpa} />
              </div>
            </Calculator>

            <Calculator title="Airflow">
              <div className="flex gap-2">
                <div className="flex-1">
                  <CalcInput label="Value" value={flowValue} onChange={setFlowValue} />
                </div>
                <div className="w-24">
                  <CalcSelect
                    label="Unit"
                    value={flowUnit}
                    onChange={setFlowUnit}
                    options={[
                      { value: "cfm", label: "CFM" },
                      { value: "ls", label: "L/s" },
                      { value: "m3h", label: "m³/h" },
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <CalcOutput label="CFM" value={flowConversions.cfm} />
                <CalcOutput label="L/s" value={flowConversions.ls} />
                <CalcOutput label="m³/h" value={flowConversions.m3h} />
              </div>
            </Calculator>

            <Calculator title="Temperature">
              <div className="flex gap-2">
                <div className="flex-1">
                  <CalcInput label="Value" value={tempValue} onChange={setTempValue} />
                </div>
                <div className="w-20">
                  <CalcSelect
                    label="Unit"
                    value={tempUnit}
                    onChange={setTempUnit}
                    options={[
                      { value: "f", label: "°F" },
                      { value: "c", label: "°C" },
                      { value: "k", label: "K" },
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <CalcOutput label="°F" value={tempConversions.f} />
                <CalcOutput label="°C" value={tempConversions.c} />
                <CalcOutput label="K" value={tempConversions.k} />
              </div>
            </Calculator>
          </Section>
        </div>
      </section>
    </div>
  );
}
