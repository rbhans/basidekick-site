"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import {
  CaretDown,
  Plugs,
  Factory,
  Lightning,
  Drop,
  Cpu,
  Gauge,
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
        <div className="mt-1 p-4 bg-card/50 border border-border border-t-0 overflow-x-auto">
          {children}
        </div>
      )}
    </div>
  );
}

// Reference Table Component
function ReferenceTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          {headers.map((header, i) => (
            <th
              key={i}
              className="text-left py-2 px-3 text-xs font-medium text-primary uppercase tracking-wide"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`border-b border-border/50 ${rowIndex % 2 === 0 ? "bg-card/30" : ""}`}
          >
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="py-2 px-3 text-muted-foreground">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Abbreviation List Component
function AbbreviationList({
  items,
}: {
  items: { abbr: string; full: string; description?: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-2 bg-card/30 border border-border/50"
        >
          <span className="font-mono text-primary font-semibold min-w-[60px]">
            {item.abbr}
          </span>
          <span className="text-muted-foreground">
            {item.full}
            {item.description && (
              <span className="text-xs text-muted-foreground/70 block mt-0.5">
                {item.description}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

// Reference Data
const bacnetObjectTypes = [
  ["0", "AI", "Analog Input", "Sensor readings (temperature, pressure, etc.)"],
  ["1", "AO", "Analog Output", "Control outputs (valve positions, damper commands)"],
  ["2", "AV", "Analog Value", "Setpoints, calculations, internal values"],
  ["3", "BI", "Binary Input", "Status points (on/off, open/closed)"],
  ["4", "BO", "Binary Output", "On/Off control commands"],
  ["5", "BV", "Binary Value", "Modes, enables, internal binary states"],
  ["6", "CAL", "Calendar", "Holiday calendars, exception schedules"],
  ["8", "DEV", "Device", "Device object (one per device)"],
  ["13", "MSI", "Multi-state Input", "Multi-position status (fan speeds, modes)"],
  ["14", "MSO", "Multi-state Output", "Multi-position control commands"],
  ["19", "MSV", "Multi-state Value", "Operating modes, internal multi-state values"],
  ["17", "SCH", "Schedule", "Time-based schedules"],
  ["20", "TL", "Trend Log", "Historical data logging"],
  ["15", "NC", "Notification Class", "Alarm routing configuration"],
  ["10", "FILE", "File", "File objects for data transfer"],
  ["16", "PROGRAM", "Program", "Control programs"],
];

const modbusRegisterTypes = [
  ["Coils", "00001-09999", "R/W", "FC01 (Read), FC05 (Write Single), FC15 (Write Multiple)", "Single bit, discrete outputs"],
  ["Discrete Inputs", "10001-19999", "R/O", "FC02 (Read)", "Single bit, discrete inputs"],
  ["Input Registers", "30001-39999", "R/O", "FC04 (Read)", "16-bit, analog inputs"],
  ["Holding Registers", "40001-49999", "R/W", "FC03 (Read), FC06 (Write Single), FC16 (Write Multiple)", "16-bit, read/write data"],
];

const hvacEquipment = [
  { abbr: "AHU", full: "Air Handling Unit", description: "Central air conditioning unit with fan, coils, filters" },
  { abbr: "VAV", full: "Variable Air Volume", description: "Terminal unit that varies airflow based on demand" },
  { abbr: "FCU", full: "Fan Coil Unit", description: "Local unit with fan and heating/cooling coil" },
  { abbr: "RTU", full: "Rooftop Unit", description: "Self-contained packaged HVAC unit" },
  { abbr: "MAU", full: "Makeup Air Unit", description: "Provides conditioned outside air" },
  { abbr: "ERV", full: "Energy Recovery Ventilator", description: "Recovers energy from exhaust air" },
  { abbr: "HRV", full: "Heat Recovery Ventilator", description: "Recovers sensible heat from exhaust air" },
  { abbr: "DX", full: "Direct Expansion", description: "Refrigerant-based cooling system" },
  { abbr: "VRF", full: "Variable Refrigerant Flow", description: "Multi-split system with variable refrigerant" },
  { abbr: "VRV", full: "Variable Refrigerant Volume", description: "Daikin trademark for VRF systems" },
  { abbr: "CRAC", full: "Computer Room Air Conditioner", description: "Precision cooling for data centers" },
  { abbr: "CRAH", full: "Computer Room Air Handler", description: "Chilled water precision cooling" },
  { abbr: "DOAS", full: "Dedicated Outdoor Air System", description: "Handles 100% outdoor air separately" },
  { abbr: "EF", full: "Exhaust Fan", description: "Removes air from spaces" },
  { abbr: "SF", full: "Supply Fan", description: "Delivers conditioned air to spaces" },
  { abbr: "RF", full: "Return Fan", description: "Returns air from spaces to AHU" },
];

const pipingFluids = [
  { abbr: "CHW", full: "Chilled Water", description: "Cold water for cooling (typically 42-55°F)" },
  { abbr: "HHW", full: "Hot/Heating Water", description: "Hot water for heating (typically 140-180°F)" },
  { abbr: "CW", full: "Condenser Water", description: "Water circulated through cooling towers" },
  { abbr: "CWS", full: "Condenser Water Supply", description: "Cool water to condenser" },
  { abbr: "CWR", full: "Condenser Water Return", description: "Warm water from condenser" },
  { abbr: "CHWS", full: "Chilled Water Supply", description: "Cold water from chiller" },
  { abbr: "CHWR", full: "Chilled Water Return", description: "Warmer water returning to chiller" },
  { abbr: "HHWS", full: "Hot Water Supply", description: "Hot water from boiler" },
  { abbr: "HHWR", full: "Hot Water Return", description: "Cooler water returning to boiler" },
  { abbr: "GPM", full: "Gallons Per Minute", description: "Flow rate measurement" },
  { abbr: "PSI", full: "Pounds Per Square Inch", description: "Pressure measurement" },
  { abbr: "PSIG", full: "PSI Gauge", description: "Pressure relative to atmospheric" },
  { abbr: "PSIA", full: "PSI Absolute", description: "Pressure relative to vacuum" },
  { abbr: "ΔT", full: "Delta T (Temperature Difference)", description: "Supply/return temperature difference" },
  { abbr: "ΔP", full: "Delta P (Pressure Difference)", description: "Differential pressure" },
];

const controlsAbbreviations = [
  { abbr: "DDC", full: "Direct Digital Control", description: "Microprocessor-based control system" },
  { abbr: "BAS", full: "Building Automation System", description: "Centralized building control system" },
  { abbr: "BMS", full: "Building Management System", description: "Broader building systems integration" },
  { abbr: "EMS", full: "Energy Management System", description: "Energy monitoring and optimization" },
  { abbr: "SCADA", full: "Supervisory Control and Data Acquisition", description: "Large-scale monitoring/control" },
  { abbr: "HMI", full: "Human-Machine Interface", description: "Operator interface/display" },
  { abbr: "PLC", full: "Programmable Logic Controller", description: "Industrial controller" },
  { abbr: "PID", full: "Proportional-Integral-Derivative", description: "Control loop feedback mechanism" },
  { abbr: "COV", full: "Change of Value", description: "Event-driven value reporting" },
  { abbr: "MSTP", full: "Master-Slave Token Passing", description: "BACnet network protocol" },
  { abbr: "BIP", full: "BACnet/IP", description: "BACnet over IP networks" },
  { abbr: "BBMD", full: "BACnet Broadcast Management Device", description: "Enables BACnet across subnets" },
  { abbr: "OAT", full: "Outside Air Temperature", description: "Ambient outdoor temperature" },
  { abbr: "SAT", full: "Supply Air Temperature", description: "Temperature of supply air" },
  { abbr: "RAT", full: "Return Air Temperature", description: "Temperature of return air" },
  { abbr: "MAT", full: "Mixed Air Temperature", description: "Temperature after mixing OA and RA" },
  { abbr: "SP", full: "Setpoint", description: "Target value for control" },
  { abbr: "PV", full: "Process Variable", description: "Actual measured value" },
  { abbr: "CV", full: "Control Variable", description: "Output signal to actuator" },
];

const electricalPower = [
  { abbr: "VFD", full: "Variable Frequency Drive", description: "Motor speed controller" },
  { abbr: "ASD", full: "Adjustable Speed Drive", description: "Alternative term for VFD" },
  { abbr: "kW", full: "Kilowatt", description: "Real power (1000 watts)" },
  { abbr: "kWh", full: "Kilowatt-hour", description: "Energy consumption unit" },
  { abbr: "kVA", full: "Kilovolt-Ampere", description: "Apparent power" },
  { abbr: "kVAR", full: "Kilovolt-Ampere Reactive", description: "Reactive power" },
  { abbr: "PF", full: "Power Factor", description: "Ratio of real to apparent power" },
  { abbr: "CT", full: "Current Transformer", description: "Measures AC current" },
  { abbr: "PT", full: "Potential Transformer", description: "Steps down voltage for metering" },
  { abbr: "UPS", full: "Uninterruptible Power Supply", description: "Battery backup power" },
  { abbr: "ATS", full: "Automatic Transfer Switch", description: "Switches between power sources" },
  { abbr: "MCC", full: "Motor Control Center", description: "Centralized motor control assembly" },
  { abbr: "HOA", full: "Hand-Off-Auto", description: "Manual override switch" },
  { abbr: "E-stop", full: "Emergency Stop", description: "Emergency shutdown switch" },
  { abbr: "NEC", full: "National Electrical Code", description: "US electrical installation standard" },
  { abbr: "AWG", full: "American Wire Gauge", description: "Wire size measurement" },
];

export function ReferencesView() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>resources</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            BAS References
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Quick reference materials for building automation professionals. Common
            abbreviations, protocol specifications, and industry terminology.
          </p>
        </div>
      </section>

      {/* Reference Sections */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* BACnet Object Types */}
          <Section title="BACnet Object Types" icon={<Plugs className="size-5" />} defaultOpen>
            <ReferenceTable
              headers={["Code", "Abbr", "Name", "Description"]}
              rows={bacnetObjectTypes}
            />
          </Section>

          {/* Modbus Register Types */}
          <Section title="Modbus Register Types" icon={<Cpu className="size-5" />}>
            <ReferenceTable
              headers={["Type", "Address Range", "Access", "Function Codes", "Description"]}
              rows={modbusRegisterTypes}
            />
          </Section>

          {/* HVAC Equipment */}
          <Section title="HVAC Equipment" icon={<Factory className="size-5" />}>
            <AbbreviationList items={hvacEquipment} />
          </Section>

          {/* Piping & Fluids */}
          <Section title="Piping & Fluids" icon={<Drop className="size-5" />}>
            <AbbreviationList items={pipingFluids} />
          </Section>

          {/* Controls Abbreviations */}
          <Section title="Controls Abbreviations" icon={<Gauge className="size-5" />}>
            <AbbreviationList items={controlsAbbreviations} />
          </Section>

          {/* Electrical & Power */}
          <Section title="Electrical & Power" icon={<Lightning className="size-5" />}>
            <AbbreviationList items={electricalPower} />
          </Section>
        </div>
      </section>
    </div>
  );
}
