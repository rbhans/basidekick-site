"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

// Collapsible Section Component — numbered accordion
function Section({
  num,
  title,
  defaultOpen = false,
  children,
}: {
  num: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-baseline gap-3.5 pb-3.5 border-b border-foreground text-left"
      >
        <span className="font-mono text-[11px] text-accent tracking-[1px]">{num} /</span>
        <span className="font-heading font-semibold text-[20px] leading-none text-foreground">
          {title}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
          [ {open ? "COLLAPSE" : "EXPAND"} ]
        </span>
        <CaretDown
          className={`w-3 h-3 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={open ? "pt-5 grid grid-cols-1 lg:grid-cols-2 gap-5" : "hidden"}>
        {children}
      </div>
    </div>
  );
}

// Calculator Card
function Calculator({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 border border-border bg-card hover:border-foreground transition-colors p-5"
    >
      <h3 className="font-mono text-[10px] uppercase tracking-[1.3px] text-accent pb-2 mb-4 border-b border-border">
        {title}
      </h3>
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
      <label className="font-mono text-[9px] uppercase tracking-[1.2px] text-muted-foreground">
        {label}
      </label>
      <div className="flex">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step="any"
          className="flex-1 min-w-0 border border-border bg-background focus:border-foreground transition-colors outline-none px-2.5 py-2 text-[13px] text-foreground font-mono tabular-nums"
        />
        {unit && (
          <span className="bg-muted border border-l-0 border-border px-2.5 py-2 font-mono text-[10px] text-muted-foreground min-w-[54px] text-center flex items-center justify-center">
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
      <label className="font-mono text-[9px] uppercase tracking-[1.2px] text-muted-foreground">
        {label}
      </label>
      <div className="flex">
        <div className="flex-1 min-w-0 bg-secondary border border-foreground px-2.5 py-2 text-foreground text-[13px] font-mono tabular-nums min-h-[36px] flex items-center break-words">
          {value || "—"}
        </div>
        {unit && (
          <span className="bg-accent border border-l-0 border-foreground px-2.5 py-2 font-mono text-[10px] text-accent-foreground min-w-[54px] text-center flex items-center justify-center">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function CalculatorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-accent pl-3 italic text-[12px] leading-[1.45] text-muted-foreground">
      {children}
    </p>
  );
}

const STANDARD_ATMOSPHERE_PSI = 14.696;

const thermistorPresets: Record<string, { label: string; r25: number; beta: number }> = {
  "10k-3892": { label: "10K NTC beta 3892", r25: 10000, beta: 3892 },
  "10k-3977": { label: "10K NTC beta 3977", r25: 10000, beta: 3977 },
  "3k-3977": { label: "3K NTC beta 3977", r25: 3000, beta: 3977 },
};

const wireGaugeTable = [
  { gauge: "20", ohmsPer1000Ft: 10.15 },
  { gauge: "18", ohmsPer1000Ft: 6.385 },
  { gauge: "16", ohmsPer1000Ft: 4.016 },
  { gauge: "14", ohmsPer1000Ft: 2.525 },
  { gauge: "12", ohmsPer1000Ft: 1.588 },
  { gauge: "10", ohmsPer1000Ft: 0.999 },
];

function hasInvalidNumbers(values: number[]) {
  return values.some((value) => Number.isNaN(value) || !Number.isFinite(value));
}

function saturationVaporPressurePsi(tempF: number) {
  const rankine = tempF + 459.67;
  return Math.exp(77.345 + 0.0057 * rankine - 7235 / rankine) / Math.pow(rankine, 8.2);
}

function getHumidityRatio(tempF: number, relativeHumidity: number, pressurePsi = STANDARD_ATMOSPHERE_PSI) {
  const vaporPressure = Math.max(0, Math.min(1, relativeHumidity / 100)) * saturationVaporPressurePsi(tempF);
  if (vaporPressure >= pressurePsi) return Number.NaN;
  return (0.62198 * vaporPressure) / (pressurePsi - vaporPressure);
}

function getMoistAirEnthalpy(tempF: number, relativeHumidity: number) {
  const humidityRatio = getHumidityRatio(tempF, relativeHumidity);
  if (!Number.isFinite(humidityRatio)) return Number.NaN;
  return 0.24 * tempF + humidityRatio * (1061 + 0.444 * tempF);
}

// Select Component — styled native select
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
      <label className="font-mono text-[9px] uppercase tracking-[1.2px] text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-border bg-background focus:border-foreground transition-colors outline-none px-2.5 py-2 text-[13px] text-foreground appearance-none cursor-pointer pr-8"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
          ▾
        </span>
      </div>
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
    if (hasInvalidNumbers([rawMin, rawMax, engMin, engMax, raw]) || rawMax === rawMin) {
      return "";
    }
    const scaled = ((raw - rawMin) / (rawMax - rawMin)) * (engMax - engMin) + engMin;
    return scaled.toFixed(2);
  })();

  // Thermistor Calculator
  const [thermResistance, setThermResistance] = useState("10000");
  const [thermType, setThermType] = useState("10k-3892");

  const thermTemp = (() => {
    const r = parseFloat(thermResistance);
    const preset = thermistorPresets[thermType];
    if (!preset || Number.isNaN(r) || r <= 0) return "";
    const tKelvin = 1 / (1 / 298.15 + Math.log(r / preset.r25) / preset.beta);
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
    if (hasInvalidNumbers([p, elev]) || p <= 0) return "";
    const atmosphereRatio = Math.pow(1 - 0.00000687535 * elev, 5.2559);
    if (atmosphereRatio <= 0) return "";
    const corrected = p / atmosphereRatio;
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
    if (hasInvalidNumbers([cfm, l, w, h]) || l <= 0 || w <= 0 || h <= 0) return "";
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
      oaFraction = parseFloat(matOaDamper);
    if (hasInvalidNumbers([oa, ra, oaFraction])) return "";
    const boundedFraction = Math.max(0, Math.min(100, oaFraction)) / 100;
    const mat = oa * boundedFraction + ra * (1 - boundedFraction);
    return mat.toFixed(1);
  })();

  // Economizer Enthalpy
  const [econTemp, setEconTemp] = useState("70");
  const [econRh, setEconRh] = useState("50");

  const econEnthalpy = (() => {
    const t = parseFloat(econTemp),
      rh = parseFloat(econRh);
    if (hasInvalidNumbers([t, rh])) return "";
    const h = getMoistAirEnthalpy(t, rh);
    if (!Number.isFinite(h)) return "";
    return h.toFixed(2);
  })();

  // Optimal Start
  const [optStartDeltaT, setOptStartDeltaT] = useState("10");
  const [optStartMass, setOptStartMass] = useState("medium");

  const optStartTime = (() => {
    const dt = parseFloat(optStartDeltaT);
    if (Number.isNaN(dt)) return "";
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
    if ([bldg, floor, dev].some(Number.isNaN)) return "";
    const instance = bldg * 100000 + floor * 1000 + dev;
    return instance.toString();
  })();

  // MS/TP Segment Check
  const [mstpLengthFt, setMstpLengthFt] = useState("1200");
  const [mstpUnitLoads, setMstpUnitLoads] = useState("16");

  const mstpSegment = (() => {
    const length = parseFloat(mstpLengthFt),
      unitLoads = parseFloat(mstpUnitLoads);
    if (hasInvalidNumbers([length, unitLoads])) return { status: "", limit: "" };
    const lengthOk = length <= 4000;
    const loadOk = unitLoads <= 32;
    return {
      status: lengthOk && loadOk ? "Within typical segment limits" : "Split segment or add repeater",
      limit: "4000 ft / 32 unit loads",
    };
  })();

  // Trend Log Storage
  const [trendPoints, setTrendPoints] = useState("100");
  const [trendInterval, setTrendInterval] = useState("5");
  const [trendRetention, setTrendRetention] = useState("30");

  const trendStorage = (() => {
    const points = parseInt(trendPoints),
      interval = parseInt(trendInterval),
      days = parseInt(trendRetention);
    if ([points, interval, days].some(Number.isNaN) || interval <= 0) return "";
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
  const [pumpCfactor, setPumpCfactor] = useState("140");

  const pumpHead = (() => {
    const gpm = parseFloat(pumpGpm),
      length = parseFloat(pumpLength),
      size = parseFloat(pumpSize),
      cFactor = parseFloat(pumpCfactor);
    if (hasInvalidNumbers([gpm, length, size, cFactor]) || size <= 0 || cFactor <= 0) return "";
    const frictionLoss =
      (4.52 * Math.pow(gpm, 1.85) * length) /
      (Math.pow(cFactor, 1.85) * Math.pow(size, 4.87));
    return frictionLoss.toFixed(1);
  })();

  // Glycol Heat Transfer
  const [glycolPercent, setGlycolPercent] = useState("30");

  const glycolEffect = (() => {
    const pct = parseFloat(glycolPercent);
    if (Number.isNaN(pct)) return { capacity: "", flow: "" };
    const boundedPct = Math.max(0, Math.min(60, pct));
    const capacityLoss = boundedPct * 0.5;
    const flowIncrease = boundedPct * 0.3;
    return {
      capacity: `${(100 - capacityLoss).toFixed(0)}%`,
      flow: `+${flowIncrease.toFixed(0)}%`,
    };
  })();

  // Expansion Tank
  const [expVolume, setExpVolume] = useState("100");
  const [expDeltaT, setExpDeltaT] = useState("40");
  const [expFillPressure, setExpFillPressure] = useState("12");
  const [expMaxPressure, setExpMaxPressure] = useState("28");

  const expTankSize = (() => {
    const vol = parseFloat(expVolume),
      dt = parseFloat(expDeltaT),
      fill = parseFloat(expFillPressure),
      max = parseFloat(expMaxPressure);
    if (hasInvalidNumbers([vol, dt, fill, max]) || max <= fill) {
      return { expansion: "", tank: "" };
    }
    const expansion = vol * dt * 0.00023;
    const acceptance = (max - fill) / (max + STANDARD_ATMOSPHERE_PSI);
    const tankSize = acceptance > 0 ? expansion / acceptance : Number.NaN;
    return {
      expansion: expansion.toFixed(2),
      tank: Number.isFinite(tankSize) ? tankSize.toFixed(1) : "",
    };
  })();

  // Cv Calculator
  const [cvFlow, setCvFlow] = useState("50");
  const [cvDeltaP, setCvDeltaP] = useState("4");
  const [cvSg, setCvSg] = useState("1.0");

  const cvResult = (() => {
    const flow = parseFloat(cvFlow),
      dp = parseFloat(cvDeltaP),
      sg = parseFloat(cvSg);
    if (hasInvalidNumbers([flow, dp, sg]) || dp === 0 || sg <= 0) return "";
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
    if (hasInvalidNumbers([v, a, pf])) return "";
    const kw = (v * a * Math.sqrt(3) * pf) / 1000;
    return kw.toFixed(2);
  })();

  // Transformer VA
  const [xfmrLoads, setXfmrLoads] = useState("20");
  const [xfmrVaEach, setXfmrVaEach] = useState("15");

  const xfmrSize = (() => {
    const loads = parseInt(xfmrLoads),
      va = parseFloat(xfmrVaEach);
    if (Number.isNaN(loads) || Number.isNaN(va)) return "";
    const total = loads * va * 1.25;
    const sizes = [50, 75, 100, 150, 200, 300, 500, 750, 1000];
    const recommended = sizes.find((s) => s >= total) || sizes[sizes.length - 1];
    return `${Math.ceil(total)} VA (use ${recommended} VA)`;
  })();

  // Wire Gauge
  const [wireLength, setWireLength] = useState("100");
  const [wireAmps, setWireAmps] = useState("2");
  const [wireVoltage, setWireVoltage] = useState("24");
  const [wireDropPct, setWireDropPct] = useState("5");

  const wireGauge = (() => {
    const len = parseFloat(wireLength),
      amps = parseFloat(wireAmps),
      volts = parseFloat(wireVoltage),
      dropPct = parseFloat(wireDropPct);
    if (hasInvalidNumbers([len, amps, volts, dropPct]) || volts <= 0 || dropPct <= 0) return "";
    const maxDrop = volts * (dropPct / 100);
    const selected = wireGaugeTable.find((wire) => {
      const drop = (2 * len * amps * wire.ohmsPer1000Ft) / 1000;
      return drop <= maxDrop;
    });
    if (!selected) return ">10 AWG or shorten run";
    const drop = (2 * len * amps * selected.ohmsPer1000Ft) / 1000;
    return `${selected.gauge} AWG (${drop.toFixed(2)} V drop)`;
  })();

  // UPS Runtime
  const [upsWh, setUpsWh] = useState("216");
  const [upsLoadWatts, setUpsLoadWatts] = useState("500");
  const [upsEfficiency, setUpsEfficiency] = useState("85");

  const upsRuntime = (() => {
    const wh = parseFloat(upsWh),
      load = parseFloat(upsLoadWatts),
      efficiency = parseFloat(upsEfficiency);
    if (hasInvalidNumbers([wh, load, efficiency]) || load <= 0) return "";
    const runtime = ((wh * (efficiency / 100)) / load) * 60;
    return `~${Math.round(runtime)} minutes`;
  })();

  // Dew Point
  const [dpTemp, setDpTemp] = useState("72");
  const [dpRh, setDpRh] = useState("50");

  const dewPoint = (() => {
    const t = parseFloat(dpTemp),
      rh = parseFloat(dpRh);
    if (hasInvalidNumbers([t, rh]) || rh <= 0) return "";
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
    if (hasInvalidNumbers([t, rh])) return "";
    const h = getMoistAirEnthalpy(t, rh);
    if (!Number.isFinite(h)) return "";
    return h.toFixed(2);
  })();

  // Wet Bulb
  const [wbTemp, setWbTemp] = useState("80");
  const [wbRh, setWbRh] = useState("60");

  const wetBulb = (() => {
    const t = parseFloat(wbTemp),
      rh = parseFloat(wbRh);
    if (hasInvalidNumbers([t, rh]) || rh < 0 || rh > 100) return "";
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
    if (hasInvalidNumbers([t, rh])) return { grains: "", lbm: "" };
    const w = getHumidityRatio(t, rh);
    if (!Number.isFinite(w)) return { grains: "", lbm: "" };
    const grains = w * 7000;
    return { grains: grains.toFixed(1), lbm: (w * 1000).toFixed(3) };
  })();

  // Optimal Stop
  const [osCoastTime, setOsCoastTime] = useState("30");
  const [osOccEnd, setOsOccEnd] = useState("17:00");

  const optStopTime = (() => {
    const coast = parseInt(osCoastTime);
    if (Number.isNaN(coast) || !osOccEnd) return "";
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
  const [holidayYear, setHolidayYear] = useState("2026");

  const holidayDate = (() => {
    const month = parseInt(holidayMonth),
      nth = parseInt(holidayNth);
    const dayOfWeek = parseInt(holidayDay),
      year = parseInt(holidayYear);
    if ([month, nth, dayOfWeek, year].some(Number.isNaN)) return "";
    if (nth === -1) {
      for (let d = 31; d >= 1; d--) {
        const date = new Date(year, month - 1, d);
        if (date.getMonth() !== month - 1) continue;
        if (date.getDay() === dayOfWeek) {
          return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
      }
    }
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
    if (Number.isNaN(days)) return "";
    let minutesPerDay = eh * 60 + em - (sh * 60 + sm);
    if (minutesPerDay < 0) minutesPerDay += 24 * 60;
    const hoursPerDay = minutesPerDay / 60;
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
    if (hasInvalidNumbers([exp, act, tol])) return { diff: "", status: "" };
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
    if (hasInvalidNumbers([travel, speed]) || speed === 0) return "";
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
    if (hasInvalidNumbers([designCfm, designSp, actualCfm]) || designCfm === 0) return "";
    const newSp = designSp * Math.pow(actualCfm / designCfm, 2);
    return newSp.toFixed(2);
  })();

  // BTU Calculator
  const [btuGpm, setBtuGpm] = useState("50");
  const [btuDeltaT, setBtuDeltaT] = useState("10");

  const btuResult = (() => {
    const gpm = parseFloat(btuGpm),
      dt = parseFloat(btuDeltaT);
    if (hasInvalidNumbers([gpm, dt])) return { btu: "", tons: "" };
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
    if (hasInvalidNumbers([kw, tons]) || tons === 0) return "";
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
    if (hasInvalidNumbers([reduction, hp, hours, cost])) return { kwh: "", dollars: "" };
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
    if (hasInvalidNumbers([entering, leaving, wb])) return { range: "", approach: "" };
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
    if (hasInvalidNumbers([ku, tu]) || tu === 0) return { kp: "", ki: "", kd: "" };
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
    if (hasInvalidNumbers([oatMin, oatMax, spMin, spMax, oat]) || oatMax === oatMin) return "";
    const ratio = Math.max(0, Math.min(1, (oat - oatMin) / (oatMax - oatMin)));
    const sp = spMin + ratio * (spMax - spMin);
    return sp.toFixed(1);
  })();

  // Pressure Conversions
  const [pressureValue, setPressureValue] = useState("1");
  const [pressureUnit, setPressureUnit] = useState("iwc");

  const pressureConversions = (() => {
    const val = parseFloat(pressureValue);
    if (Number.isNaN(val)) return { iwc: "", pa: "", psi: "", kpa: "" };
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
    if (Number.isNaN(val)) return { cfm: "", ls: "", m3h: "" };
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
    if (Number.isNaN(val)) return { f: "", c: "", k: "" };
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
    if (Number.isNaN(mask) || mask < 0 || mask > 32) return { hosts: "", range: "" };
    const hosts = mask === 32 ? 1 : mask === 31 ? 2 : Math.pow(2, 32 - mask) - 2;
    const octets = subnetIp.split(".").map(Number);
    if (
      octets.length !== 4 ||
      octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)
    ) {
      return { hosts: "", range: "" };
    }
    const ipNum = octets.reduce((acc, oct, i) => acc + (oct << (24 - i * 8)), 0) >>> 0;
    const maskNum = mask === 0 ? 0 : (0xffffffff << (32 - mask)) >>> 0;
    const network = ipNum & maskNum;
    const broadcast = network | (~maskNum >>> 0);
    const toIp = (n: number) =>
      [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
    if (mask === 32) {
      return {
        hosts: hosts.toLocaleString(),
        range: toIp(network),
      };
    }
    if (mask === 31) {
      return {
        hosts: hosts.toLocaleString(),
        range: `${toIp(network)} - ${toIp(broadcast)}`,
      };
    }
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
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Calculators</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">BAS Quick Math</span>
        </div>
        <div className="field">
          <span className="field-label">Sections</span>
          <span className="field-value tabular-nums">11</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Caution</span>
          <span className="field-value">Verify critical values</span>
        </div>
      </div>

      <section className="container mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16 py-14">
        <p className="italic text-[17px] text-muted-foreground text-center leading-[1.5] mb-12 max-w-[680px] mx-auto">
          Quick reference calculators for building automation professionals. For estimation
          purposes — verify critical calculations.
        </p>
        <section
          aria-labelledby="calculator-answer-summary"
          className="border-y border-foreground py-5 mb-10"
        >
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr_1fr]">
            <div>
              <h2
                id="calculator-answer-summary"
                className="font-mono text-[10px] uppercase tracking-[1.4px] text-accent"
              >
                Answer-first field math
              </h2>
              <p className="mt-2 text-[14px] leading-[1.55] text-foreground">
                Use this page for BAS field checks around airflow, hydronic heat transfer,
                duct static reset, signal scaling, and controller network sizing.
              </p>
            </div>
            <dl className="grid gap-3 text-[13px] leading-[1.45]">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
                  Air changes
                </dt>
                <dd className="text-foreground">
                  ACH = CFM x 60 / room volume in cubic feet.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
                  Hydronic BTU
                </dt>
                <dd className="text-foreground">
                  BTU/hr = GPM x Delta T x 500 for water.
                </dd>
              </div>
            </dl>
            <dl className="grid gap-3 text-[13px] leading-[1.45]">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
                  Duct static reset
                </dt>
                <dd className="text-foreground">
                  Static = design static x (actual CFM / design CFM)^2.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
                  Network sizing
                </dt>
                <dd className="text-foreground">
                  Use subnet host count before assigning BAS controller addresses.
                </dd>
              </div>
            </dl>
          </div>
        </section>
        <div className="w-full">
          {/* Sensor & Signal Scaling */}
          <Section num="01" title="Sensor & signal scaling" defaultOpen>
            <Calculator title="Analog Input Scaling" id="analog-input-scaling-calculator">
              <div className="grid grid-cols-2 gap-2">
                <CalcInput label="Raw Min" value={analogRawMin} onChange={setAnalogRawMin} unit="mA/V" />
                <CalcInput label="Raw Max" value={analogRawMax} onChange={setAnalogRawMax} unit="mA/V" />
                <CalcInput label="Eng Min" value={analogEngMin} onChange={setAnalogEngMin} />
                <CalcInput label="Eng Max" value={analogEngMax} onChange={setAnalogEngMax} />
              </div>
              <CalcInput label="Raw Input Value" value={analogRawValue} onChange={setAnalogRawValue} unit="mA/V" />
              <CalcOutput label="Scaled Output" value={analogScaled} unit="eng" />
              <CalculatorNote>
                Linear scaling only. For live-zero signals, verify fault handling separately.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Thermistor Temperature">
              <CalcSelect
                label="Thermistor Type"
                value={thermType}
                onChange={setThermType}
                options={[
                  ...Object.entries(thermistorPresets).map(([value, preset]) => ({
                    value,
                    label: preset.label,
                  })),
                ]}
              />
              <CalcInput label="Resistance" value={thermResistance} onChange={setThermResistance} unit="Ω" />
              <CalcOutput label="Temperature" value={thermTemp} />
              <CalculatorNote>
                Beta-curve approximation. Use the sensor manufacturer table for commissioning.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Pressure with Elevation">
              <CalcInput label="Station Pressure" value={pressureRaw} onChange={setPressureRaw} unit="psia" />
              <CalcInput label="Elevation" value={elevation} onChange={setElevation} unit="ft" />
              <CalcOutput label="Sea-Level Equivalent" value={pressureCorrected} unit="psia" />
              <CalculatorNote>
                Uses the standard atmosphere pressure relation; enter absolute station pressure.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Airside Calculations */}
          <Section num="02" title="Airside calculations">
            <Calculator title="Air Changes per Hour" id="air-changes-per-hour-calculator">
              <CalcInput label="Airflow" value={achCfm} onChange={setAchCfm} unit="CFM" />
              <div className="grid grid-cols-3 gap-2">
                <CalcInput label="Length" value={achLength} onChange={setAchLength} unit="ft" />
                <CalcInput label="Width" value={achWidth} onChange={setAchWidth} unit="ft" />
                <CalcInput label="Height" value={achHeight} onChange={setAchHeight} unit="ft" />
              </div>
              <CalcOutput label="Air Changes/Hour" value={achResult} unit="ACH" />
            </Calculator>

            <Calculator title="Mixed Air Temperature" id="mixed-air-temperature-calculator">
              <CalcInput label="Outside Air Temp" value={matOaTemp} onChange={setMatOaTemp} unit="°F" />
              <CalcInput label="Return Air Temp" value={matRaTemp} onChange={setMatRaTemp} unit="°F" />
              <CalcInput label="OA Air Fraction" value={matOaDamper} onChange={setMatOaDamper} unit="%" />
              <CalcOutput label="Mixed Air Temp" value={matResult} unit="°F" />
              <CalculatorNote>
                Uses actual outdoor-air fraction, not damper blade position.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Economizer Enthalpy">
              <CalcInput label="Dry Bulb Temp" value={econTemp} onChange={setEconTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={econRh} onChange={setEconRh} unit="%" />
              <CalcOutput label="Enthalpy" value={econEnthalpy} unit="BTU/lb" />
              <CalculatorNote>
                Sea-level moist-air estimate. Compare OA and RA at the same pressure basis.
              </CalculatorNote>
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
              <CalculatorNote>
                Rule-of-thumb setup value. Real optimal start should learn from recovery history.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Network & Integration */}
          <Section num="03" title="Network & integration">
            <Calculator title="BACnet Device Instance">
              <CalcInput label="Building Number" value={bacnetBuilding} onChange={setBacnetBuilding} />
              <CalcInput label="Floor Number" value={bacnetFloor} onChange={setBacnetFloor} />
              <CalcInput label="Device Number" value={bacnetDevice} onChange={setBacnetDevice} />
              <CalcOutput label="Device Instance" value={bacnetInstance} />
            </Calculator>

            <Calculator title="MS/TP Segment Check">
              <CalcInput label="Segment Length" value={mstpLengthFt} onChange={setMstpLengthFt} unit="ft" />
              <CalcInput label="Unit Loads" value={mstpUnitLoads} onChange={setMstpUnitLoads} />
              <CalcOutput label="Status" value={mstpSegment.status} />
              <CalcOutput label="Typical Limit" value={mstpSegment.limit} />
              <CalculatorNote>
                Quick RS-485 screen only. Cable type, transceiver loading, termination, and biasing still matter.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Trend Log Storage">
              <CalcInput label="Number of Points" value={trendPoints} onChange={setTrendPoints} />
              <CalcInput label="Sample Interval" value={trendInterval} onChange={setTrendInterval} unit="min" />
              <CalcInput label="Retention Period" value={trendRetention} onChange={setTrendRetention} unit="days" />
              <CalcOutput label="Storage Required" value={trendStorage} unit="MB" />
              <CalculatorNote>
                Assumes 20 bytes per sample before database/index overhead.
              </CalculatorNote>
            </Calculator>

            <Calculator title="IP Subnet Calculator" id="ip-subnet-calculator">
              <CalcInput label="Network Address" value={subnetIp} onChange={setSubnetIp} type="text" />
              <CalcInput label="CIDR Mask" value={subnetMask} onChange={setSubnetMask} unit="bits" />
              <CalcOutput label="Usable Hosts" value={subnetInfo.hosts} />
              <CalcOutput label="Host Range" value={subnetInfo.range} />
              <CalculatorNote>
                Useful for BAS VLAN planning; verify gateway, DHCP reservations, and vendor discovery needs.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Hydronic Systems */}
          <Section num="04" title="Hydronic systems">
            <Calculator title="Pump Head Pressure">
              <CalcInput label="Flow Rate" value={pumpGpm} onChange={setPumpGpm} unit="GPM" />
              <CalcInput label="Pipe Run Length" value={pumpLength} onChange={setPumpLength} unit="ft" />
              <CalcInput label="Inside Diameter" value={pumpSize} onChange={setPumpSize} unit="in" />
              <CalcInput label="Hazen-Williams C" value={pumpCfactor} onChange={setPumpCfactor} />
              <CalcOutput label="Friction Loss" value={pumpHead} unit="ft H₂O" />
              <CalculatorNote>
                Water-only Hazen-Williams estimate for straight pipe. Add fittings, valves, coils, strainers, and glycol correction separately.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Glycol Effects">
              <CalcInput label="Glycol Concentration" value={glycolPercent} onChange={setGlycolPercent} unit="%" />
              <CalcOutput label="Heat Transfer Capacity" value={glycolEffect.capacity} />
              <CalcOutput label="Required Flow Increase" value={glycolEffect.flow} />
              <CalculatorNote>
                Screening estimate only. Use glycol manufacturer data for freeze point, viscosity, and pump correction.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Expansion Tank Sizing">
              <CalcInput label="System Volume" value={expVolume} onChange={setExpVolume} unit="gal" />
              <CalcInput label="Temperature Rise" value={expDeltaT} onChange={setExpDeltaT} unit="°F" />
              <CalcInput label="Fill Pressure" value={expFillPressure} onChange={setExpFillPressure} unit="psig" />
              <CalcInput label="Max Pressure" value={expMaxPressure} onChange={setExpMaxPressure} unit="psig" />
              <CalcOutput label="Expanded Volume" value={expTankSize.expansion} unit="gal" />
              <CalcOutput label="Minimum Tank Size" value={expTankSize.tank} unit="gal" />
              <CalculatorNote>
                Water estimate with diaphragm-tank acceptance. Confirm fill pressure, relief setting, and tank manufacturer selection.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Valve Cv Calculator">
              <CalcInput label="Flow Rate" value={cvFlow} onChange={setCvFlow} unit="GPM" />
              <CalcInput label="Pressure Drop" value={cvDeltaP} onChange={setCvDeltaP} unit="PSI" />
              <CalcInput label="Specific Gravity" value={cvSg} onChange={setCvSg} />
              <CalcOutput label="Required Cv" value={cvResult} />
              <CalculatorNote>
                Liquid Cv estimate. Check valve authority, closeoff pressure, and manufacturer sizing.
              </CalculatorNote>
            </Calculator>

            <Calculator title="BTU from Flow" id="btu-from-flow-calculator">
              <CalcInput label="Flow Rate" value={btuGpm} onChange={setBtuGpm} unit="GPM" />
              <CalcInput label="Temperature Difference" value={btuDeltaT} onChange={setBtuDeltaT} unit="°F" />
              <CalcOutput label="Heat Transfer" value={btuResult.btu} unit="BTU/hr" />
              <CalcOutput label="Cooling Tons" value={btuResult.tons} unit="tons" />
              <CalculatorNote>
                Uses the common water constant 500. Adjust for glycol or unusual fluid properties.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Electrical & Power */}
          <Section num="05" title="Electrical & power">
            <Calculator title="3-Phase Power">
              <CalcInput label="Voltage" value={powerVolts} onChange={setPowerVolts} unit="V" />
              <CalcInput label="Current" value={powerAmps} onChange={setPowerAmps} unit="A" />
              <CalcInput label="Power Factor" value={powerPf} onChange={setPowerPf} />
              <CalcOutput label="Power" value={power3Phase} unit="kW" />
              <CalculatorNote>
                Balanced three-phase estimate: kW = V x A x sqrt(3) x PF / 1000.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Transformer Sizing">
              <CalcInput label="Number of Loads" value={xfmrLoads} onChange={setXfmrLoads} />
              <CalcInput label="VA per Load" value={xfmrVaEach} onChange={setXfmrVaEach} unit="VA" />
              <CalcOutput label="Recommended Size" value={xfmrSize} />
              <CalculatorNote>
                Adds 25% spare capacity before selecting the next listed transformer size.
              </CalculatorNote>
            </Calculator>

            <Calculator title="24VAC Wire Gauge">
              <CalcInput label="One-Way Distance" value={wireLength} onChange={setWireLength} unit="ft" />
              <CalcInput label="Load Current" value={wireAmps} onChange={setWireAmps} unit="A" />
              <CalcInput label="Control Voltage" value={wireVoltage} onChange={setWireVoltage} unit="V" />
              <CalcInput label="Max Voltage Drop" value={wireDropPct} onChange={setWireDropPct} unit="%" />
              <CalcOutput label="Recommended Gauge" value={wireGauge} />
              <CalculatorNote>
                Copper two-conductor loop using NEC-style AWG resistance values; check local code and device minimum voltage.
              </CalculatorNote>
            </Calculator>

            <Calculator title="UPS Runtime">
              <CalcInput label="Battery Energy" value={upsWh} onChange={setUpsWh} unit="Wh" />
              <CalcInput label="Connected Load" value={upsLoadWatts} onChange={setUpsLoadWatts} unit="W" />
              <CalcInput label="Inverter Efficiency" value={upsEfficiency} onChange={setUpsEfficiency} unit="%" />
              <CalcOutput label="Estimated Runtime" value={upsRuntime} />
              <CalculatorNote>
                Runtime from battery Wh is more honest than VA nameplate. Use vendor curves for final backup claims.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Psychrometrics */}
          <Section num="06" title="Psychrometrics">
            <Calculator title="Dew Point">
              <CalcInput label="Dry Bulb Temp" value={dpTemp} onChange={setDpTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={dpRh} onChange={setDpRh} unit="%" />
              <CalcOutput label="Dew Point" value={dewPoint} />
              <CalculatorNote>
                Magnus approximation, suitable for quick HVAC checks.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Enthalpy">
              <CalcInput label="Dry Bulb Temp" value={enthalpyTemp} onChange={setEnthalpyTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={enthalpyRh} onChange={setEnthalpyRh} unit="%" />
              <CalcOutput label="Enthalpy" value={enthalpyResult} unit="BTU/lb" />
              <CalculatorNote>
                Sea-level moist-air estimate. Use a psychrometric tool when elevation matters.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Wet Bulb Temperature">
              <CalcInput label="Dry Bulb Temp" value={wbTemp} onChange={setWbTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={wbRh} onChange={setWbRh} unit="%" />
              <CalcOutput label="Wet Bulb" value={wetBulb} />
              <CalculatorNote>
                Approximation for normal meteorological ranges, not a replacement for a psychrometric chart.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Humidity Ratio">
              <CalcInput label="Dry Bulb Temp" value={hrTemp} onChange={setHrTemp} unit="°F" />
              <CalcInput label="Relative Humidity" value={hrRh} onChange={setHrRh} unit="%" />
              <CalcOutput label="Grains/lb dry air" value={humidityRatio.grains} unit="gr/lb" />
              <CalcOutput label="lb moisture/1000 lb air" value={humidityRatio.lbm} />
              <CalculatorNote>
                Sea-level pressure basis; humidity ratio changes with barometric pressure.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Scheduling & Time */}
          <Section num="07" title="Scheduling & time">
            <Calculator title="Optimal Stop Time">
              <CalcInput label="Coast Time" value={osCoastTime} onChange={setOsCoastTime} unit="min" />
              <CalcInput label="Occupancy End" value={osOccEnd} onChange={setOsOccEnd} type="time" />
              <CalcOutput label="Equipment Stop Time" value={optStopTime} />
              <CalculatorNote>
                Simple coast-time subtraction. Validate comfort drift before enabling stop optimization.
              </CalculatorNote>
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
                    { value: "-1", label: "Last" },
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
              <CalculatorNote>
                Useful for BAS exception schedule dates like fourth Thursday or last Monday.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Occupied Hours per Year">
              <div className="grid grid-cols-2 gap-2">
                <CalcInput label="Start Time" value={occStart} onChange={setOccStart} type="time" />
                <CalcInput label="End Time" value={occEnd} onChange={setOccEnd} type="time" />
              </div>
              <CalcInput label="Days per Week" value={occDays} onChange={setOccDays} />
              <CalcOutput label="Hours per Year" value={occHoursYear} unit="hrs" />
              <CalculatorNote>
                Handles overnight schedules by rolling the end time into the next day.
              </CalculatorNote>
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
              <CalculatorNote>
                Starting point for trend setup. Alarms, diagnostics, and metering may need faster or COV logging.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Commissioning & Troubleshooting */}
          <Section num="08" title="Commissioning & troubleshooting">
            <Calculator title="Sensor Drift Check">
              <CalcInput label="Expected Value" value={driftExpected} onChange={setDriftExpected} />
              <CalcInput label="Actual Reading" value={driftActual} onChange={setDriftActual} />
              <CalcInput label="Tolerance" value={driftTolerance} onChange={setDriftTolerance} unit="±" />
              <CalcOutput label="Deviation" value={driftStatus.diff} />
              <CalcOutput label="Status" value={driftStatus.status} />
              <CalculatorNote>
                Compare against a calibrated reference, not another unverified BAS value.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Actuator Stroke Time">
              <CalcInput label="Travel (degrees or %)" value={actTravel} onChange={setActTravel} />
              <CalcInput label="Speed (per second)" value={actSpeed} onChange={setActSpeed} unit="/sec" />
              <CalcOutput label="Full Stroke Time" value={strokeTime} />
              <CalculatorNote>
                Use actuator nameplate speed under load where available.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Duct Static Setpoint" id="duct-static-setpoint-calculator">
              <CalcInput label="Design CFM" value={ductDesignCfm} onChange={setDuctDesignCfm} unit="CFM" />
              <CalcInput label="Design Static" value={ductDesignSp} onChange={setDuctDesignSp} unit="in WC" />
              <CalcInput label="Actual CFM" value={ductActualCfm} onChange={setDuctActualCfm} unit="CFM" />
              <CalcOutput label="Adjusted Setpoint" value={ductSpSetpoint} unit="in WC" />
              <CalculatorNote>
                Fan-law square relationship for a rough reset curve point, not a balancing substitute.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Energy & Equipment */}
          <Section num="09" title="Energy & equipment">
            <Calculator title="Chiller Efficiency">
              <CalcInput label="Power Input" value={chillerKw} onChange={setChillerKw} unit="kW" />
              <CalcInput label="Cooling Output" value={chillerTons} onChange={setChillerTons} unit="tons" />
              <CalcOutput label="Efficiency" value={chillerEfficiency} unit="kW/ton" />
              <CalculatorNote>
                Use total chiller input power and measured tons at the same operating condition.
              </CalculatorNote>
            </Calculator>

            <Calculator title="VFD Energy Savings">
              <CalcInput label="Speed Reduction" value={vfdSpeedReduction} onChange={setVfdSpeedReduction} unit="%" />
              <CalcInput label="Motor Size" value={vfdMotorHp} onChange={setVfdMotorHp} unit="HP" />
              <CalcInput label="Operating Hours" value={vfdHoursYear} onChange={setVfdHoursYear} unit="hrs/yr" />
              <CalcInput label="Electricity Cost" value={vfdKwhCost} onChange={setVfdKwhCost} unit="$/kWh" />
              <CalcOutput label="Annual kWh Saved" value={vfdSavings.kwh} unit="kWh" />
              <CalcOutput label="Annual Savings" value={vfdSavings.dollars} />
              <CalculatorNote>
                Cube-law fan/pump estimate. Real savings depend on static reset, minimum speeds, and operating profile.
              </CalculatorNote>
            </Calculator>

            <Calculator title="Cooling Tower Performance">
              <CalcInput label="Entering Water Temp" value={ctEntering} onChange={setCtEntering} unit="°F" />
              <CalcInput label="Leaving Water Temp" value={ctLeaving} onChange={setCtLeaving} unit="°F" />
              <CalcInput label="Wet Bulb Temp" value={ctWetBulb} onChange={setCtWetBulb} unit="°F" />
              <CalcOutput label="Range" value={ctResults.range} unit="°F" />
              <CalcOutput label="Approach" value={ctResults.approach} unit="°F" />
              <CalculatorNote>
                Range is entering minus leaving water. Approach is leaving water minus entering wet bulb.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Controls Math */}
          <Section num="10" title="Controls math">
            <Calculator title="PID Tuning (Ziegler-Nichols)">
              <CalcInput label="Ultimate Gain (Ku)" value={pidKu} onChange={setPidKu} />
              <CalcInput label="Ultimate Period (Tu)" value={pidTu} onChange={setPidTu} unit="sec" />
              <CalcOutput label="Kp (Proportional)" value={pidParams.kp} />
              <CalcOutput label="Ki (Integral)" value={pidParams.ki} />
              <CalcOutput label="Kd (Derivative)" value={pidParams.kd} />
              <CalculatorNote>
                Ziegler-Nichols can be aggressive. Use cautiously on real equipment and trend the result.
              </CalculatorNote>
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
              <CalculatorNote>
                Linear reset only. Clamp limits and equipment safeties still belong in the controller logic.
              </CalculatorNote>
            </Calculator>
          </Section>

          {/* Unit Conversions */}
          <Section num="11" title="Unit conversions">
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

            <Calculator title="Airflow" id="airflow-cfm-conversion-calculator">
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
