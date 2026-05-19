"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

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
    <div className="mb-4">
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
      <div className={open ? "pt-5" : "hidden"}>{children}</div>
    </div>
  );
}

function ReferenceTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="border border-border bg-card overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-foreground bg-muted">
            {headers.map((header) => (
              <th
                key={header}
                className="text-left py-2.5 px-3 font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className="py-2.5 px-3 text-foreground align-top leading-[1.5]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AbbreviationList({
  items,
}: {
  items: { abbr: string; full: string; description?: string }[];
}) {
  return (
    <div className="border-t border-b border-foreground">
      <dl className="grid grid-cols-1 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.abbr}
            className="grid grid-cols-[80px_1fr] gap-3 py-3 px-3 border-b border-border"
          >
            <dt className="font-mono text-[12px] text-accent font-bold tabular-nums tracking-tight">
              {item.abbr}
            </dt>
            <dd>
              <div className="text-[13px] text-foreground leading-[1.35]">{item.full}</div>
              {item.description && (
                <div className="font-heading italic text-[12px] text-muted-foreground mt-0.5 leading-[1.4]">
                  {item.description}
                </div>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SourceNote({
  children,
  sources,
}: {
  children: React.ReactNode;
  sources?: { label: string; href: string }[];
}) {
  return (
    <div className="mt-3 border-l-2 border-accent pl-3">
      <p className="font-heading italic text-[12px] leading-[1.45] text-muted-foreground">
        {children}
      </p>
      {sources && sources.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {sources.map((source) => (
            <a
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-[1.1px] text-accent hover:underline"
            >
              {source.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const sourceLinks = {
  bacnetEnum: {
    label: "BACnet object enum",
    href: "https://reference.opcfoundation.org/specs/OPC-30030/10.4",
  },
  bacnetLanguage: {
    label: "BACnet overview",
    href: "https://bacnet.org/wp-content/uploads/sites/4/2022/06/The-Language-of-BACnet-1.pdf",
  },
  modbusSpec: {
    label: "Modbus spec",
    href: "https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf",
  },
  ashraePsych: {
    label: "ASHRAE psychrometrics",
    href: "https://handbook.ashrae.org/Handbooks/F25/SI/F25_Ch01/F25_Ch01_si.aspx",
  },
  bapiThermistor: {
    label: "BAPI thermistors",
    href: "https://www.bapihvac.com/thermistor-overview/",
  },
};

const bacnetObjectTypes = [
  ["0", "AI", "Analog Input", "Sensor readings such as temperature, pressure, or flow"],
  ["1", "AO", "Analog Output", "Commandable analog output such as valve or damper command"],
  ["2", "AV", "Analog Value", "Setpoints, calculations, limits, and other software values"],
  ["3", "BI", "Binary Input", "Two-state status such as fan proof, alarm, or contact closure"],
  ["4", "BO", "Binary Output", "Commandable two-state output such as start/stop"],
  ["5", "BV", "Binary Value", "Software enable, mode bit, alarm latch, or interlock state"],
  ["6", "CAL", "Calendar", "Date list used by schedules for holidays and exceptions"],
  ["7", "CMD", "Command", "Writes a set of values to a list of object properties"],
  ["8", "DEV", "Device", "Physical BACnet device and its identity/protocol properties"],
  ["9", "EE", "Event Enrollment", "Event monitoring for objects without intrinsic reporting"],
  ["10", "FILE", "File", "File object for configuration, data transfer, or device data"],
  ["11", "GRP", "Group", "Local grouping of object/property references"],
  ["12", "LOOP", "Loop", "Control loop object such as PI or PID loop"],
  ["13", "MSI", "Multi-state Input", "Physical multi-position status such as fan speed feedback"],
  ["14", "MSO", "Multi-state Output", "Commandable multi-position output"],
  ["15", "NC", "Notification Class", "Alarm/event routing and recipient configuration"],
  ["16", "PGM", "Program", "Control program object"],
  ["17", "SCH", "Schedule", "Weekly and exception schedules that write to referenced objects"],
  ["18", "AVG", "Averaging", "Statistical summary of a referenced object value"],
  ["19", "MSV", "Multi-state Value", "Software mode, state, or enumerated setpoint"],
  ["20", "TL", "Trend Log", "Single-channel trend buffer"],
  ["25", "EL", "Event Log", "Local alarm/event log buffer"],
  ["27", "TLM", "Trend Log Multiple", "Multi-channel trend buffer"],
  ["29", "SV", "Structured View", "User-oriented hierarchy of BACnet objects"],
  ["54", "LO", "Lighting Output", "Commandable lighting output object"],
];

const bacnetPriorities = [
  ["1", "Manual Life Safety", "Highest priority. Reserve for tested life-safety operation."],
  ["2", "Automatic Life Safety", "Automatic life-safety command layer."],
  ["3-4", "Available", "Site/vendor specific. Document before using."],
  ["5", "Critical Equipment Control", "Critical equipment or plant-protection command."],
  ["6", "Minimum On/Off", "Minimum runtime, anti-short-cycle, or similar limit."],
  ["7", "Available", "Site/vendor specific."],
  ["8", "Manual Operator", "Common priority for operator overrides/forced values."],
  ["9-15", "Available", "Common place for programs, schedules, and integrations by convention."],
  ["16", "Default/lowest", "Lowest command priority before Relinquish_Default is used."],
  ["NULL", "Relinquish", "Write NULL at a priority to release that layer of control."],
];

const modbusRegisterTypes = [
  ["Coils", "0xxxx", "1 bit", "R/W", "FC01 read, FC05 write single, FC15 write multiple"],
  ["Discrete Inputs", "1xxxx", "1 bit", "Read only", "FC02 read"],
  ["Input Registers", "3xxxx", "16 bit", "Read only", "FC04 read"],
  ["Holding Registers", "4xxxx", "16 bit", "R/W", "FC03 read, FC06 write single, FC16 write multiple"],
];

const modbusFunctionCodes = [
  ["01", "Read Coils", "Reads one or more coil bits"],
  ["02", "Read Discrete Inputs", "Reads one or more input bits"],
  ["03", "Read Holding Registers", "Reads 16-bit holding registers"],
  ["04", "Read Input Registers", "Reads 16-bit input registers"],
  ["05", "Write Single Coil", "Writes one coil bit"],
  ["06", "Write Single Register", "Writes one holding register"],
  ["15", "Write Multiple Coils", "Writes a range of coil bits"],
  ["16", "Write Multiple Registers", "Writes a range of holding registers"],
  ["23", "Read/Write Multiple Registers", "Combined holding-register read/write transaction"],
];

const modbusExceptions = [
  ["01", "Illegal Function", "The server does not support the requested function code"],
  ["02", "Illegal Data Address", "Requested address is not valid for that device/map"],
  ["03", "Illegal Data Value", "Quantity or value is outside the allowed range"],
  ["04", "Server Device Failure", "Device failed while trying to perform the request"],
  ["05", "Acknowledge", "Accepted but long-duration processing is still underway"],
  ["06", "Server Device Busy", "Retry later"],
];

const signalRanges = [
  ["4-20 mA", "Analog current loop", "Robust for long field runs; 4 mA is live zero"],
  ["0-10 VDC", "Voltage input/output", "Common for dampers, valves, VFD speed references"],
  ["2-10 VDC", "Live-zero voltage", "Often maps 2 V to 0% and 10 V to 100%"],
  ["0-5 VDC", "Voltage input/output", "Common on packaged equipment and transducers"],
  ["Dry contact", "Binary input", "Voltage-free contact; controller supplies wetting voltage"],
  ["Pulse", "Totalization", "Used by meters; confirm pulse weight and debounce/filtering"],
  ["10K Type II/III", "NTC thermistor", "Curve must match controller setup; types are not interchangeable"],
  ["RTD", "Resistance temperature", "Confirm Pt/Ni type, nominal resistance, and wiring method"],
];

const networkQuickRefs = [
  ["BACnet/IP", "UDP 47808 / 0xBAC0", "Default BACnet/IP port; BBMD/foreign-device setup is needed across routed broadcasts"],
  ["BACnet MS/TP", "RS-485 trunk", "Daisy-chain bus, termination at segment ends, polarity and biasing matter"],
  ["Modbus TCP", "TCP 502", "Unit identifier may still matter when routing to RTU devices"],
  ["Modbus RTU", "RS-485 serial", "Match baud, parity, stop bits, slave ID, and register offset convention"],
  ["Ethernet BAS panels", "Managed switch ports", "Coordinate VLANs, static/reserved IPs, NTP, DNS, and firewall rules"],
];

const psychrometricRefs = [
  ["Humidity ratio", "W", "Mass of water vapor per mass of dry air"],
  ["Dew point", "td", "Temperature at saturation for the same humidity ratio and pressure"],
  ["Wet bulb", "twb", "Thermodynamic wet-bulb is a psychrometric property, not just a sensor style"],
  ["Enthalpy", "h", "Total heat of moist air, typically used in economizer comparison"],
  ["Standard pressure", "14.696 psia", "Sea-level psychrometric shortcuts assume standard pressure unless corrected"],
];

const hvacEquipment = [
  { abbr: "AHU", full: "Air Handling Unit", description: "Central unit with fan, coils, filters, and mixed/outdoor air sections" },
  { abbr: "VAV", full: "Variable Air Volume", description: "Terminal unit that varies airflow based on zone demand" },
  { abbr: "FPB", full: "Fan Powered Box", description: "VAV terminal with fan, often parallel or series style" },
  { abbr: "FCU", full: "Fan Coil Unit", description: "Local unit with fan and heating/cooling coil" },
  { abbr: "RTU", full: "Rooftop Unit", description: "Self-contained packaged HVAC unit" },
  { abbr: "MAU", full: "Makeup Air Unit", description: "Provides conditioned outside air" },
  { abbr: "ERV", full: "Energy Recovery Ventilator", description: "Transfers energy between exhaust and outside-air streams" },
  { abbr: "HRV", full: "Heat Recovery Ventilator", description: "Recovers sensible heat from exhaust air" },
  { abbr: "DOAS", full: "Dedicated Outdoor Air System", description: "Handles ventilation air separately from zone loads" },
  { abbr: "DX", full: "Direct Expansion", description: "Refrigerant-based cooling system" },
  { abbr: "VRF", full: "Variable Refrigerant Flow", description: "Multi-zone refrigerant system with variable capacity" },
  { abbr: "VRV", full: "Variable Refrigerant Volume", description: "Daikin trademark for VRF systems" },
  { abbr: "CRAC", full: "Computer Room Air Conditioner", description: "Precision DX cooling for data centers" },
  { abbr: "CRAH", full: "Computer Room Air Handler", description: "Precision chilled-water air handler for data centers" },
  { abbr: "EF", full: "Exhaust Fan", description: "Removes air from spaces" },
  { abbr: "SF", full: "Supply Fan", description: "Delivers conditioned air to spaces" },
  { abbr: "RF", full: "Return Fan", description: "Returns air from spaces to AHU" },
  { abbr: "CH", full: "Chiller", description: "Produces chilled water for cooling loads" },
  { abbr: "CT", full: "Cooling Tower", description: "Rejects heat from condenser water loop" },
  { abbr: "HX", full: "Heat Exchanger", description: "Transfers heat between separated fluid loops" },
];

const pipingFluids = [
  { abbr: "CHW", full: "Chilled Water", description: "Cold water for cooling; design supply is often 42-45°F but varies by site" },
  { abbr: "HHW", full: "Hot/Heating Water", description: "Hot water for heating; low-temp and condensing systems may run much lower than legacy loops" },
  { abbr: "CW", full: "Condenser Water", description: "Water circulated between chiller condenser and cooling tower" },
  { abbr: "CWS", full: "Condenser Water Supply", description: "Water supplied to the condenser" },
  { abbr: "CWR", full: "Condenser Water Return", description: "Water returning from the condenser toward heat rejection" },
  { abbr: "CHWS", full: "Chilled Water Supply", description: "Cold water leaving chiller/plant toward loads" },
  { abbr: "CHWR", full: "Chilled Water Return", description: "Warmer water returning from loads" },
  { abbr: "HHWS", full: "Hot Water Supply", description: "Hot water leaving boiler/plant toward loads" },
  { abbr: "HHWR", full: "Hot Water Return", description: "Cooler water returning from loads" },
  { abbr: "GPM", full: "Gallons Per Minute", description: "Hydronic flow rate" },
  { abbr: "PSI", full: "Pounds Per Square Inch", description: "Pressure measurement" },
  { abbr: "PSIG", full: "PSI Gauge", description: "Pressure relative to atmosphere" },
  { abbr: "PSIA", full: "PSI Absolute", description: "Pressure relative to vacuum" },
  { abbr: "ΔT", full: "Delta T", description: "Temperature difference, usually supply/return" },
  { abbr: "ΔP", full: "Delta P", description: "Differential pressure" },
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
  { abbr: "MS/TP", full: "Master-Slave/Token-Passing", description: "BACnet data link over EIA-485" },
  { abbr: "BBMD", full: "BACnet Broadcast Management Device", description: "Enables BACnet/IP broadcast discovery across subnets" },
  { abbr: "FDR", full: "Foreign Device Registration", description: "BACnet/IP method for temporary registration through a BBMD" },
  { abbr: "OAT", full: "Outside Air Temperature", description: "Ambient outdoor temperature" },
  { abbr: "SAT", full: "Supply Air Temperature", description: "Temperature of supply air" },
  { abbr: "RAT", full: "Return Air Temperature", description: "Temperature of return air" },
  { abbr: "MAT", full: "Mixed Air Temperature", description: "Temperature after mixing OA and RA" },
  { abbr: "SP", full: "Setpoint", description: "Target value for control" },
  { abbr: "PV", full: "Process Variable", description: "Actual measured value" },
  { abbr: "CV", full: "Control Variable", description: "Output signal to actuator or final element" },
];

const electricalPower = [
  { abbr: "VFD", full: "Variable Frequency Drive", description: "Motor speed controller" },
  { abbr: "ASD", full: "Adjustable Speed Drive", description: "Alternative term for VFD" },
  { abbr: "kW", full: "Kilowatt", description: "Real power" },
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
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">References</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">BAS Quick Reference</span>
        </div>
        <div className="field">
          <span className="field-label">Sections</span>
          <span className="field-value tabular-nums">11</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Format</span>
          <span className="field-value">Field sheet</span>
        </div>
      </div>

      <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-14">
        <p className="font-heading italic text-[17px] text-muted-foreground text-center leading-[1.5] mb-12 max-w-[680px] mx-auto">
          Practical BAS reference sheets for protocol lookup, signal checks, field terminology,
          and source-backed reminders that are easy to scan on site.
        </p>

        <Section num="01" title="BACnet object types" defaultOpen>
          <ReferenceTable
            headers={["Code", "Abbr", "Name", "Use"]}
            rows={bacnetObjectTypes}
          />
          <SourceNote sources={[sourceLinks.bacnetEnum, sourceLinks.bacnetLanguage]}>
            Common BACnet object types are listed here for field lookup. The live standard
            includes more object types; verify the object list exposed by the actual device.
          </SourceNote>
        </Section>

        <Section num="02" title="BACnet command priorities">
          <ReferenceTable
            headers={["Priority", "Name", "Field note"]}
            rows={bacnetPriorities}
          />
          <SourceNote sources={[sourceLinks.bacnetLanguage]}>
            BACnet commandable objects use the highest non-NULL priority value. Releasing an
            override means writing NULL at the same priority used for the command.
          </SourceNote>
        </Section>

        <Section num="03" title="Modbus data model">
          <ReferenceTable
            headers={["Type", "Legacy ref", "Width", "Access", "Common function codes"]}
            rows={modbusRegisterTypes}
          />
          <SourceNote sources={[sourceLinks.modbusSpec]}>
            The 0xxxx/1xxxx/3xxxx/4xxxx notation is a field convention. Actual protocol
            addresses are zero-based offsets, so always confirm whether a device manual uses
            one-based register numbers or protocol offsets.
          </SourceNote>
        </Section>

        <Section num="04" title="Modbus function codes & exceptions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ReferenceTable
              headers={["FC", "Name", "Use"]}
              rows={modbusFunctionCodes}
            />
            <ReferenceTable
              headers={["Code", "Exception", "Likely cause"]}
              rows={modbusExceptions}
            />
          </div>
          <SourceNote sources={[sourceLinks.modbusSpec]}>
            These are the public function codes and common exception responses most often seen
            during BAS integrations.
          </SourceNote>
        </Section>

        <Section num="05" title="Signals & sensors">
          <ReferenceTable
            headers={["Signal", "Type", "Field note"]}
            rows={signalRanges}
          />
          <SourceNote sources={[sourceLinks.bapiThermistor]}>
            Thermistor resistance curves are device-specific. Match the BAS input setup to the
            installed sensor curve before treating a temperature reading as calibrated.
          </SourceNote>
        </Section>

        <Section num="06" title="Network quick refs">
          <ReferenceTable
            headers={["Protocol", "Default / medium", "Field note"]}
            rows={networkQuickRefs}
          />
          <SourceNote sources={[sourceLinks.bacnetLanguage, sourceLinks.modbusSpec]}>
            Protocol defaults help during triage, but site firewall, VLAN, router, and serial
            settings determine what will actually communicate.
          </SourceNote>
        </Section>

        <Section num="07" title="Psychrometrics terms">
          <ReferenceTable
            headers={["Term", "Symbol", "Field note"]}
            rows={psychrometricRefs}
          />
          <SourceNote sources={[sourceLinks.ashraePsych]}>
            Psychrometric values depend on barometric pressure. Sea-level shortcuts are useful
            for quick checks, not final design at elevation.
          </SourceNote>
        </Section>

        <Section num="08" title="HVAC equipment">
          <AbbreviationList items={hvacEquipment} />
        </Section>

        <Section num="09" title="Piping & fluids">
          <AbbreviationList items={pipingFluids} />
        </Section>

        <Section num="10" title="Controls abbreviations">
          <AbbreviationList items={controlsAbbreviations} />
        </Section>

        <Section num="11" title="Electrical & power">
          <AbbreviationList items={electricalPower} />
        </Section>
      </section>
    </div>
  );
}
