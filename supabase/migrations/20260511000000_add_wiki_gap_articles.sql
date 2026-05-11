-- Add new wiki articles to fill identified content gaps
-- Sources cited inline per article

-- ============================================================
-- Article 1: Modbus Troubleshooting Guide
-- Gap: Protocol "Modbus" facet has only 1 article
-- Sources:
--   - Modbus Application Protocol Specification V1.1b3 (modbus.org)
--   - Schneider Electric Modbus Exception Codes (product-help.schneider-electric.com)
--   - Campbell Scientific Modbus Troubleshooting Guide (s.campbellsci.com)
--   - FlowFuse: Modbus TCP vs Modbus RTU (flowfuse.com/blog/2026/02/modbus-tcp-vs-modbus-rtu)
--   - Valtoris: Fixing Modbus TCP/RTU Timeout Errors (valtoris.com)
-- ============================================================
INSERT INTO wiki_articles (title, slug, summary, content, category_id, is_published)
VALUES (
  'Modbus Troubleshooting Guide for BAS Technicians',
  'modbus-troubleshooting-guide-bas-technicians',
  'Systematic troubleshooting procedures for Modbus RTU and Modbus TCP communication problems in building automation systems, including exception code reference and field diagnostics.',
  '## Modbus Troubleshooting Guide for BAS Technicians

Modbus is one of the most widely used protocols in BAS for integrating meters, VFDs, chillers, boilers, and other third-party equipment. Communication failures are common during commissioning and can be caused by physical wiring faults, incorrect configuration, or device-level issues. This guide provides a systematic approach to diagnosing and resolving Modbus problems in the field.

## Systematic Troubleshooting Procedure

### Step 1: Verify Physical Layer

**For Modbus RTU (RS-485):**

| Check | Expected | Action if Wrong |
|-------|----------|----------------|
| Power to device | LED on or display active | Check 24V/power supply |
| RS-485 wiring | A+ to A+, B- to B-, GND to GND | Swap A/B if reversed |
| Termination | 120Ω resistor at each end of bus | Add termination resistors |
| Cable type | Shielded twisted pair | Replace with proper cable |
| Cable length | Under 1200m (4000 ft) total | Add repeater if exceeded |
| Daisy chain | Bus topology, no star/spur stubs | Rewire as daisy chain |
| Max devices | 32 per RS-485 segment | Add repeater for more |

**For Modbus TCP:**

| Check | Expected | Action if Wrong |
|-------|----------|----------------|
| Ethernet link | Link LED solid or blinking | Check cable, switch port |
| IP address | Correct subnet, no conflicts | Verify with ping |
| Port | 502 (standard Modbus TCP) | Check device documentation |
| Switch | Managed switch recommended | Replace unmanaged if issues |
| Firewall | Port 502 open | Add firewall rule |

### Step 2: Verify Communication Parameters

For Modbus RTU, **all devices on the bus** must share identical serial settings:

| Parameter | Common Defaults | Notes |
|-----------|----------------|-------|
| Baud Rate | 9600 | Must match all devices; some VFDs default to 19200 |
| Data Bits | 8 | Always 8 for Modbus |
| Parity | None or Even | Per Modbus spec: if Parity=None, use 2 Stop Bits (8-N-2) |
| Stop Bits | 1 or 2 | Many devices default to 8-N-1 despite spec calling for 8-N-2 |
| Slave Address | 1-247 | 0 is broadcast; each device must have a unique address |

> **Common Pitfall:** The Modbus specification states that if Parity is set to None, there must be 2 Stop Bits (8-N-2). However, many device manufacturers default to 8-N-1. The master and all slaves must agree—when in doubt, try both 8-N-1 and 8-N-2. (Source: Modbus Application Protocol Specification V1.1b3)

### Step 3: Start with the Simplest Request

Before debugging complex register maps, verify basic communication:

1. Set the master to read **1 Holding Register** at **address 0** (or 40001) from **Slave ID 1**
2. If this works, the physical layer and parameters are correct
3. Then incrementally add registers and devices

### Step 4: Check Exception Codes

If the device responds but returns an error, it will send an exception code. The function code in the response will have bit 7 set (e.g., request FC 0x03, error response FC 0x83).

## Modbus Exception Codes Reference

| Code | Hex | Name | Meaning | Common Cause in BAS |
|------|-----|------|---------|-------------------|
| 1 | 0x01 | Illegal Function | Device does not support this function code | Sending Write Multiple Registers to a read-only sensor; device has incomplete Modbus implementation |
| 2 | 0x02 | Illegal Data Address | Requested register does not exist | 0-based vs 1-based addressing error; register outside valid range |
| 3 | 0x03 | Illegal Data Value | Value in write request is not acceptable | Writing invalid value to a coil (must be 0xFF00 or 0x0000 for FC05); out-of-range setpoint |
| 4 | 0x04 | Server Device Failure | Device has an internal fault | Check device event log; power cycle device |
| 5 | 0x05 | Acknowledge | Request accepted but processing takes time | Firmware update in progress; configuration save—wait and retry |
| 6 | 0x06 | Server Device Busy | Device is busy with another operation | Reduce polling rate; add 50-100ms inter-request delay |
| 8 | 0x08 | Memory Parity Error | Device detected memory error | Hardware fault—replace device |
| 10 | 0x0A | Gateway Path Unavailable | Gateway cannot route to target network | Check gateway serial port configuration |
| 11 | 0x0B | Gateway Target No Response | Downstream device did not respond | Target device is offline, wrong address, or serial settings are mismatched |

(Source: Modbus Application Protocol Specification V1.1b3, Schneider Electric Modbus Comm Guide)

## Modbus RTU-Specific Issues

### No Response (Timeout)

Timeouts are the single most common Modbus issue. The master sends a request and receives nothing back.

**Checklist:**
1. Verify slave address matches device DIP switches or configuration
2. Check A+/B- wiring is not swapped (most common wiring error)
3. Confirm baud rate, parity, and stop bits match on ALL devices
4. Verify termination resistors are present at both ends of the bus
5. Check cable shield is grounded at one end only
6. Use a multimeter to measure RS-485 bias voltage (should be 200mV-5V between A and B with no traffic)
7. Check for electrical noise from VFDs, contactors, or power cables running parallel

### Intermittent Communication

**Causes:**
- Loose terminal connections (tighten all screw terminals)
- Missing or incorrect termination resistors
- RS-485 cable running alongside power cables (separate by at least 300mm / 12 inches)
- Too many devices on one segment (max 32 per RS-485 segment without repeaters)
- Ground potential differences between devices (ensure GND reference wire is connected)

### CRC Errors

CRC errors indicate data corruption on the wire:
- Check for electrical interference from nearby VFDs or motor starters
- Verify cable is shielded twisted pair
- Ensure shield ground is connected at one end only (avoid ground loops)
- Reduce baud rate to 9600 if noise is severe

## Modbus TCP-Specific Issues

### Connection Refused

- Verify device IP address and subnet mask
- Confirm port 502 is open (some devices use non-standard ports)
- Check that the device''s Modbus TCP server is enabled in its configuration
- Verify no IP address conflict on the network

### Intermittent TCP Disconnection

- Check Ethernet cable quality and termination
- Verify managed switch is not blocking traffic (VLAN, port security)
- Monitor TCP keepalive settings—some devices close idle connections after 30-60 seconds
- RTU over TCP gateways (e.g., MOXA MGate, Schneider ConneXium) tunnel raw RTU frames over TCP sockets; ensure the gateway''s serial settings match the downstream RTU devices

(Source: FlowFuse, Valtoris)

## Register Addressing Confusion

One of the most frequent Modbus integration problems is register addressing:

| Convention | Register 1 | Register 100 | Notes |
|-----------|-----------|-------------|-------|
| Modbus Protocol (0-based) | 0 | 99 | What goes on the wire |
| Modbus Documentation (1-based) | 1 | 100 | What most manuals show |
| 40001 Convention | 40001 | 40100 | Holding Registers with 4xxxx prefix |
| 30001 Convention | 30001 | 30100 | Input Registers with 3xxxx prefix |

**Rule of thumb:** If reading register 40001 returns unexpected data, try address 40000 (or 0). The off-by-one error between 0-based protocol addressing and 1-based documentation addressing is the most common Modbus integration mistake.

## Tools for Modbus Troubleshooting

| Tool | Type | Use Case |
|------|------|----------|
| Modbus Poll / Modbus Slave | Software (Windows) | Simulate master/slave, test register reads |
| QModMaster | Software (free, open-source) | Quick serial and TCP Modbus testing |
| CAS Modbus Scanner | Software (free) | Scan for devices, read registers |
| Multimeter | Hardware | Check RS-485 voltage, continuity, termination |
| USB-to-RS485 adapter | Hardware | Connect laptop directly to RS-485 bus |
| Wireshark | Software (free) | Capture and analyze Modbus TCP packets |

## Quick-Reference Troubleshooting Flowchart

```
Device not responding?
├── Check power and LEDs → No power? Fix power supply
├── Check wiring (A+/B-, termination) → Wiring wrong? Rewire
├── Verify comm settings match → Mismatch? Correct settings
├── Try simplest request (1 register) → Works? Register map issue
├── Get exception code? → See Exception Code table above
└── Still failing? → Use Modbus scanner tool to poll bus
```',
  (SELECT id FROM wiki_categories WHERE slug = 'troubleshooting'),
  true
);

-- ============================================================
-- Article 2: OPC UA Integration Guide for Building Automation
-- Gap: Protocol "OPC UA" facet has only 1 article
-- Sources:
--   - OPC Foundation BACnet Companion Specification (reference.opcfoundation.org/BACnet/v200)
--   - OPC Foundation: Mapping BACnet to OPC UA (opcconnect.opcfoundation.org)
--   - ASHRAE SSPC 135 / ISO 16484-5 BACnet standard
--   - IEC 62541 OPC UA standard
--   - OPC UA Tutorial (plcprogramming.io/blog/opc-ua-tutorial-complete-guide)
-- ============================================================
INSERT INTO wiki_articles (title, slug, summary, content, category_id, is_published)
VALUES (
  'OPC UA Integration Guide for Building Automation',
  'opc-ua-integration-guide-building-automation',
  'Practical guide to integrating OPC UA with building automation systems, including BACnet interoperability, server configuration, security setup, and gateway selection.',
  '## OPC UA Integration Guide for Building Automation

OPC Unified Architecture (OPC UA, IEC 62541) is an industrial interoperability standard increasingly adopted in building automation to bridge BAS with enterprise IT, cloud analytics, and industrial control systems. This guide covers practical integration of OPC UA in BAS environments.

## What Is OPC UA?

OPC UA is a platform-independent, service-oriented architecture for secure and reliable data exchange. Unlike its predecessor OPC DA (which required Windows COM/DCOM), OPC UA runs on any operating system and uses a single TCP port (default 4840) for all communication.

| Feature | OPC DA (Legacy) | OPC UA |
|---------|----------------|--------|
| Transport | Windows COM/DCOM | TCP/IP (port 4840) |
| Platform | Windows only | Cross-platform |
| Security | DCOM security | X.509 certificates, encryption, signing |
| Data Model | Flat tag list | Rich information model with types and relationships |
| Firewall | Multiple dynamic ports | Single port (4840) |
| Standard | OPC Foundation proprietary | IEC 62541 international standard |

(Source: IEC 62541, OPC Foundation)

## OPC UA and BACnet Interoperability

A joint working group between ASHRAE SSPC 135 (BACnet) and the OPC Foundation has defined a companion specification that maps BACnet objects to OPC UA data structures. Since both protocols use object-oriented data models, the mapping is straightforward.

### BACnet to OPC UA Object Mapping

| BACnet Object | OPC UA Representation |
|--------------|----------------------|
| Analog Input | OPC UA Variable (Float) with engineering units |
| Analog Output | OPC UA Variable (Float) with write access |
| Analog Value | OPC UA Variable (Float) |
| Binary Input | OPC UA Variable (Boolean) |
| Binary Output | OPC UA Variable (Boolean) with write access |
| Binary Value | OPC UA Variable (Boolean) |
| Multi-State Input | OPC UA Variable (enumeration) |
| Schedule | OPC UA complex type with time/value pairs |
| Trend Log | OPC UA Historical Access node |
| Notification Class | OPC UA Alarm & Condition |

(Source: OPC Foundation BACnet Companion Specification v2.0)

### Communication Infrastructure

BACnet supports 8 different physical network layers including IPv4, IPv6, and serial networks (EIA-485, EIA-232), while OPC UA communicates exclusively over TCP/IP. A gateway device or software layer is required to bridge BACnet field networks to OPC UA clients.

(Source: OPC Foundation BACnet Companion Specification)

## Common Integration Architectures

### Architecture 1: BACnet/IP to OPC UA Gateway

```
BACnet/IP Devices → BACnet/IP Network → OPC UA Gateway → OPC UA Clients
                                              ↓
                                     Cloud / Analytics / SCADA
```

A dedicated gateway device (hardware or software) acts as a BACnet client on the BAS network and an OPC UA server for IT/cloud clients. This is the most common architecture for connecting BAS to enterprise systems.

### Architecture 2: Embedded OPC UA Server

Some modern BAS controllers and supervisors include an embedded OPC UA server. For example:
- Tridium Niagara 4 supports OPC UA via add-on modules
- Siemens Desigo CC includes native OPC UA server capability
- Schneider Electric EcoStruxure supports OPC UA connectivity

### Architecture 3: Edge Gateway for Cloud Integration

```
Field Controllers → BAS Supervisor → OPC UA Edge Gateway → MQTT/Cloud
```

An edge device runs an OPC UA client that reads BAS data and publishes it to cloud platforms via MQTT or REST APIs.

## Server Configuration

### Endpoint Security

OPC UA supports three security modes for each endpoint:

| Security Mode | Description | Use Case |
|--------------|-------------|----------|
| None | No encryption or signing | Testing and commissioning only |
| Sign | Messages are signed but not encrypted | Tamper detection without confidentiality |
| SignAndEncrypt | Messages are signed and encrypted | Production use (recommended) |

**Security policies** define the cryptographic algorithms:

| Policy | Status | Recommendation |
|--------|--------|---------------|
| None | Active | Testing only |
| Basic128Rsa15 | Deprecated | Do not use |
| Basic256 | Deprecated | Do not use |
| Basic256Sha256 | Current | Minimum for production |
| Aes128_Sha256_RsaOaep | Current | Recommended |
| Aes256_Sha256_RsaPss | Current | Highest security |

(Source: OPC UA Specification Part 7: Profiles, IEC 62541-7)

### Authentication

OPC UA supports multiple authentication methods:

1. **Anonymous** — No credentials required (testing only)
2. **Username/Password** — Basic credential authentication
3. **X.509 Certificate** — Mutual certificate-based authentication (recommended for production)
4. **Kerberos/LDAP** — Enterprise identity integration

(Source: IEC 62541-4, OPC UA Tutorial plcprogramming.io)

### Certificate Management

Both client and server must exchange and trust each other''s X.509 certificates:

1. On first connection, the client and server exchange certificates
2. Each side must explicitly trust the other''s certificate (manual or automatic approval)
3. Certificates must be renewed before expiration
4. Store certificates in the standard OPC UA PKI directory structure:
   - `/own/certs/` — Server''s own certificate
   - `/own/private/` — Server''s private key
   - `/trusted/certs/` — Trusted client certificates
   - `/rejected/certs/` — Rejected certificates (review and move to trusted)

## Gateway Selection Criteria

| Criteria | What to Evaluate |
|----------|-----------------|
| Protocol support | BACnet/IP, BACnet MS/TP, Modbus, LonWorks on field side |
| OPC UA profiles | Data Access, Historical Access, Alarms & Conditions |
| Capacity | Number of BACnet objects / OPC UA nodes supported |
| Performance | Polling rate, subscription support, throughput |
| Security | TLS support, certificate management, user authentication |
| Redundancy | Failover capability for critical applications |
| Management | Web UI, REST API, remote configuration |

**Common BAS-to-OPC UA Gateway Products:**

| Vendor | Product | Notes |
|--------|---------|-------|
| Chipkin | CAS BACnet to OPC UA Gateway | Software-based, supports BACnet/IP and MS/TP |
| Matrikon (Honeywell) | OPC UA Tunneller | Enterprise-grade, high capacity |
| Softing | dataFEED OPC Suite | Multi-protocol, supports BACnet and Modbus |
| Beckhoff | TwinCAT OPC UA | Integrated with Beckhoff controllers |
| LOYTEC | L-INX Automation Servers | Native BACnet and OPC UA |

## Commissioning Checklist

- [ ] Verify OPC UA server is reachable on port 4840 (or configured port)
- [ ] Configure endpoint security to SignAndEncrypt with Basic256Sha256 minimum
- [ ] Exchange and trust X.509 certificates between client and server
- [ ] Set up user authentication (disable Anonymous access for production)
- [ ] Verify BACnet object-to-OPC UA node mapping is correct
- [ ] Test read/write operations on representative data points
- [ ] Configure subscription intervals appropriate for data change rate
- [ ] Verify historical data access if trend logging is required
- [ ] Document firewall rules (port 4840 or custom port)
- [ ] Set up certificate renewal schedule',
  (SELECT id FROM wiki_categories WHERE slug = 'how-to'),
  true
);

-- ============================================================
-- Article 3: VFD Integration with Building Automation Systems
-- Gap: Topic "VFD" facet has only 1 article
-- Sources:
--   - ASHRAE Standard 135 BACnet Protocol (ashrae.org)
--   - ABB ACH550 BACnet Application Guide (automation.com)
--   - AutomationDirect DURApulse GS4 BACnet Setup (automationdirect.com)
--   - Clemson University VFD Specifications (cufacilities.sites.clemson.edu)
--   - Invertek Drives Data Centre HVAC (invertekdrives.com)
-- ============================================================
INSERT INTO wiki_articles (title, slug, summary, content, category_id, is_published)
VALUES (
  'VFD Integration with Building Automation Systems',
  'vfd-integration-building-automation-systems',
  'Guide to integrating Variable Frequency Drives with BAS via BACnet and Modbus, including point mapping, communication setup, commissioning procedures, and common troubleshooting.',
  '## VFD Integration with Building Automation Systems

Variable Frequency Drives (VFDs) are critical HVAC components that control fan and pump motor speed to match building load. Integrating VFDs with the building automation system (BAS) enables centralized monitoring, demand-based speed control, alarm management, and energy optimization. This guide covers practical VFD-to-BAS integration via BACnet and Modbus.

## Communication Protocol Options

| Protocol | Connection | Typical Use | Pros | Cons |
|----------|-----------|-------------|------|------|
| BACnet MS/TP | RS-485 daisy chain | Direct to BAS controller | Native BAS protocol; no gateway needed | Limited bandwidth; 32 devices max per trunk |
| BACnet/IP | Ethernet | High-end VFDs, large systems | Fast; leverages existing IT infrastructure | Requires Ethernet port on VFD (add-on card) |
| Modbus RTU | RS-485 daisy chain | Most common; legacy systems | Universally supported; simple | Requires register mapping; no standard object model |
| Modbus TCP | Ethernet | Newer installations | IP-based; faster than RTU | Requires Ethernet infrastructure |
| Hardwired | 4-20mA / 0-10V / dry contacts | Simple speed control | No protocol knowledge needed | Limited data; no diagnostics |

(Source: ASHRAE Standard 135, Clemson University VFD Specifications)

## BACnet VFD Integration

### Standard BACnet Object Mapping for VFDs

When a VFD supports BACnet natively, it exposes standard BACnet objects:

| BACnet Object | Object Type | Description | Typical Use |
|--------------|-------------|-------------|-------------|
| Drive Speed Command | Analog Output (AO) | Speed setpoint (%) or frequency (Hz) | Write from BAS to control speed |
| Drive Speed Feedback | Analog Input (AI) | Actual speed (%) or frequency (Hz) | Read actual running speed |
| Motor Current | Analog Input (AI) | Measured motor amps | Monitor load |
| Motor Power | Analog Input (AI) | Measured kW | Energy monitoring |
| Drive Status | Binary Input (BI) | Running / Stopped | Monitor run state |
| Drive Fault | Binary Input (BI) | Fault active / Clear | Alarm monitoring |
| Start/Stop Command | Binary Output (BO) | Start or stop the drive | Remote start/stop from BAS |
| Fault Code | Analog Input (AI) or Multi-State Input (MSI) | Numeric fault code | Diagnostics |
| Drive Enable | Binary Value (BV) | Enable/disable remote control | Safety interlock |

(Source: ASHRAE Standard 135 BACnet Object Types, ABB ACH550 BACnet Application Guide)

### BACnet Configuration Steps

1. Install BACnet communication card in VFD (if not built-in)
2. Set BACnet device instance number (unique on the network)
3. Set MAC address for MS/TP (1-127) or IP address for BACnet/IP
4. Set baud rate to match trunk (typically 38400 or 76800 for MS/TP)
5. Set APDU timeout and retries to match BAS controller
6. Enable remote Start/Stop control mode in VFD parameters
7. Verify max master and max info frames settings for MS/TP

## Modbus VFD Integration

### Common Modbus Register Map

VFD Modbus register maps vary by manufacturer, but common patterns include:

| Register (Holding) | Description | Data Type | Access |
|-------------------|-------------|-----------|--------|
| 40001 | Control Word (Start/Stop/Fault Reset) | Bit-mapped | R/W |
| 40002 | Speed Reference (0-10000 = 0-100.00%) | Unsigned 16-bit | R/W |
| 40003 | Status Word | Bit-mapped | Read |
| 40004 | Actual Speed / Frequency | Unsigned 16-bit | Read |
| 40005 | Motor Current (x10 or x100) | Unsigned 16-bit | Read |
| 40006 | Motor Voltage | Unsigned 16-bit | Read |
| 40007 | DC Bus Voltage | Unsigned 16-bit | Read |
| 40008 | Motor Power (kW x10) | Unsigned 16-bit | Read |
| 40009 | Drive Temperature | Signed 16-bit | Read |
| 40010 | Fault Code | Unsigned 16-bit | Read |

> **Important:** Register addresses, scaling factors, and bit assignments vary by manufacturer. Always consult the specific VFD Modbus manual. A 0-based vs 1-based addressing offset is common—test with a Modbus scanner tool before programming the BAS.

### Modbus Configuration Steps

1. Set Modbus slave address on VFD (unique on the RS-485 bus)
2. Configure serial parameters: baud rate, parity, stop bits
3. Set VFD control source to "Fieldbus" or "Communication" mode
4. Map register addresses in BAS controller per VFD documentation
5. Configure scaling factors (e.g., register value 5000 = 50.00 Hz)
6. Wire RS-485: A+ to A+, B- to B-, GND to GND in daisy chain
7. Add 120Ω termination at both ends of the RS-485 bus

## Commissioning Procedure

### Pre-Commissioning Checks

- [ ] VFD is properly sized for the motor (verify HP/kW rating)
- [ ] Motor nameplate data is entered in VFD parameters
- [ ] Run Automatic Motor Adaptation (auto-tune) per manufacturer instructions
- [ ] Communication card is installed and firmware is current
- [ ] RS-485 or Ethernet wiring is verified and terminated
- [ ] Communication parameters match between VFD and BAS controller

### Functional Testing

| Test | Procedure | Expected Result |
|------|-----------|----------------|
| Remote Start | Send Start command from BAS | VFD starts, status shows Running |
| Remote Stop | Send Stop command from BAS | VFD stops, status shows Stopped |
| Speed Command | Send 50% speed from BAS | VFD ramps to 50%, feedback reads ~50% |
| Speed Sweep | Ramp 0→100% in 10% increments | Feedback tracks command at each step |
| Fault Injection | Trip VFD safety (e.g., disconnect motor) | Fault alarm appears in BAS |
| Fault Reset | Send Fault Reset from BAS | Fault clears, VFD returns to ready |
| Power Monitoring | Compare BAS power reading to handheld meter | Values within 5% |
| Failsafe | Disconnect communication cable | VFD goes to configured failsafe (stop or last speed) |

(Source: Clemson University VFD Specifications, AutomationDirect DURApulse GS4 BACnet Setup)

### Safety Considerations

- **Always configure a communication loss timeout.** If the BAS stops communicating, the VFD should either stop or hold last speed, depending on the application. Typical timeout: 10-30 seconds.
- **Do not rely solely on BAS communication for safety-critical stops.** Hardwired safety circuits (Safe Torque Off / STO) must be used for emergency stop and fire alarm shutdown.
- **Verify VFD minimum and maximum frequency limits** are set correctly to prevent operation outside the motor''s rated range.
- **Enable Automatic Energy Optimization** (AEO) for variable-torque fan/pump applications to reduce energy consumption at part load.

## Common Integration Problems

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| VFD shows speed but BAS reads 0 | Wrong register address or scaling | Verify register map; check 0-based vs 1-based offset |
| Speed command has no effect | VFD not in remote/fieldbus control mode | Change VFD source parameter to Communication |
| VFD faults on start command | Motor parameters not configured | Run auto-tune; enter motor nameplate data |
| Intermittent communication loss | RS-485 wiring near VFD power cables | Separate signal and power cables; use shielded cable |
| Speed oscillates | PID loop fighting VFD internal ramp | Disable VFD internal ramp; let BAS PID handle ramp |
| Multiple VFDs lose communication | Bus overloaded or missing termination | Check device count; verify termination at both ends |',
  (SELECT id FROM wiki_categories WHERE slug = 'how-to'),
  true
);

-- ============================================================
-- Article 4: Energy Metering Integration for Building Automation
-- Gap: Topic "Meters" facet has only 1 article
-- Sources:
--   - Accuenergy Acuvim IIBN BACnet Power Meter (accuenergy.com)
--   - Cimetrics Utility Meter Integration (cimetrics.com)
--   - Honeywell Building Management Systems Energy Meters (buildings.honeywell.com)
--   - Leviton VerifEye Series 3500 Modbus/BACnet Meter (leviton.com)
--   - Siemens MD BM BACnet Power Meter Technical Overview (siemens.com)
-- ============================================================
INSERT INTO wiki_articles (title, slug, summary, content, category_id, is_published)
VALUES (
  'Energy Metering Integration for Building Automation',
  'energy-metering-integration-building-automation',
  'Guide to integrating electrical, gas, and water meters with building automation systems via BACnet, Modbus, and pulse outputs, including meter selection, point mapping, and commissioning.',
  '## Energy Metering Integration for Building Automation

Energy metering is essential for tracking building consumption, verifying energy savings, allocating costs to tenants, and complying with energy codes. This guide covers integrating electrical power meters, gas meters, and water meters with the BAS.

## Meter Communication Methods

| Method | Signal Type | Data Available | Best For |
|--------|-----------|---------------|----------|
| BACnet/IP | Ethernet | Full metering data (kW, kWh, V, A, PF) | New construction with IP infrastructure |
| BACnet MS/TP | RS-485 | Full metering data | Direct connection to BAS controller |
| Modbus RTU | RS-485 | Full metering data | Most common; wide meter support |
| Modbus TCP | Ethernet | Full metering data | IP-based meter networks |
| Pulse Output | Dry contact | Accumulated consumption only (kWh, gallons, cf) | Simple meters; gas/water meters |
| 4-20mA Analog | Current loop | Single value (instantaneous power or flow) | Legacy meters; simple interface |
| LonWorks | TP/FT-10 | Full metering data | Older installations using LON |

(Source: Accuenergy, Honeywell Building Management Systems, Leviton)

## Electrical Power Meter Integration

### Key Measurement Points

A modern BACnet or Modbus power meter provides these measurements:

| Measurement | Unit | BACnet Object Type | Use |
|------------|------|-------------------|-----|
| Real Power (kW) | kW | Analog Input | Demand monitoring, load control |
| Energy (kWh) | kWh | Analog Input or Accumulator | Consumption tracking, billing |
| Reactive Power (kVAR) | kVAR | Analog Input | Power factor monitoring |
| Apparent Power (kVA) | kVA | Analog Input | Transformer loading |
| Power Factor | Unitless (0-1) | Analog Input | Power quality |
| Voltage (per phase) | V | Analog Input | Voltage monitoring |
| Current (per phase) | A | Analog Input | Load monitoring, CT verification |
| Frequency | Hz | Analog Input | Power quality |
| Total Harmonic Distortion (THD) | % | Analog Input | Power quality, VFD impact |

(Source: Accuenergy Acuvim IIBN, Siemens MD BM Technical Overview)

### CT (Current Transformer) Selection

| CT Type | Application | Accuracy | Notes |
|---------|------------|----------|-------|
| Split-core | Retrofit (no power shutdown) | ±1% typical | Opens to clamp around existing wire |
| Solid-core | New construction | ±0.5% typical | Wire must be threaded through CT |
| Rope/Flex CT | Large conductors, busbar | ±1-2% typical | Flexible; wraps around large cables |

**Sizing rule:** Select CT ratio so normal operating current is 50-80% of CT rated primary. A 200A CT on a 100A circuit will read accurately. A 200A CT on a 20A circuit will have poor accuracy at low loads.

### Revenue-Grade vs Monitoring-Grade

| Feature | Revenue-Grade | Monitoring-Grade |
|---------|--------------|-----------------|
| Accuracy | ±0.2% to ±0.5% (ANSI C12.20) | ±1% to ±2% |
| Certification | UL/CUL listed, ANSI C12.1/C12.20 | May have UL listing |
| Use | Tenant billing, utility verification | Energy tracking, M&V |
| Cost | Higher | Lower |

(Source: Leviton VerifEye Series 3500)

## Pulse Output Integration

Many gas meters, water meters, and basic electrical meters provide pulse outputs (dry contact closures). Each pulse represents a fixed quantity of consumption.

| Meter Type | Typical Pulse Rate | Example |
|-----------|-------------------|---------|
| Electric (kWh) | 1-100 pulses per kWh | 1 pulse = 0.01 kWh |
| Gas (therms/cf) | 1 pulse per cf or per therm | 1 pulse = 1 cubic foot |
| Water (gallons) | 1 pulse per gallon or per 10 gallons | 1 pulse = 10 gallons |
| Steam (lbs) | Varies | 1 pulse = 1000 lbs |

### Pulse Input Wiring

- Connect pulse output to a **Digital Input (DI)** on the BAS controller
- Most pulse outputs are dry contacts (Form A, normally open)
- Use shielded cable; keep runs under 300m (1000 ft)
- Configure the DI as a **Pulse Accumulator** or **Counter** in the BAS
- Set the K-factor (pulses per unit) to convert raw counts to engineering units

### Pulse-to-BACnet Gateways

Dedicated gateways (e.g., Cimetrics pulse gateway) connect up to 4 pulse meters and expose readings as BACnet objects. This eliminates the need to use BAS controller DI points for metering.

(Source: Cimetrics Utility Meter Integration)

## Modbus Meter Integration

### Typical Modbus Register Map for Power Meters

| Register | Description | Format | Scaling |
|----------|------------|--------|---------|
| 40001-40002 | Voltage Phase A | Float32 (2 registers) | Direct (V) |
| 40003-40004 | Voltage Phase B | Float32 | Direct (V) |
| 40005-40006 | Voltage Phase C | Float32 | Direct (V) |
| 40007-40008 | Current Phase A | Float32 | Direct (A) |
| 40013-40014 | Total Real Power | Float32 | Direct (kW) |
| 40019-40020 | Total Power Factor | Float32 | Direct (0-1) |
| 40025-40028 | Total Energy (kWh) | Float64 or 2xFloat32 | Direct (kWh) |

> **Important:** Register addresses and data formats vary significantly between meter manufacturers. Always refer to the specific meter''s Modbus register map. Pay attention to Float32 byte order (Big-Endian vs Little-Endian / word swap).

### Common Modbus Meter Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| All readings show 0 | Wrong register addresses | Verify register map from meter documentation |
| Readings are wildly wrong | Byte order mismatch (word swap) | Try swapping high/low words for Float32 values |
| Negative power reading | CT installed backwards | Reverse CT orientation or swap CT leads |
| Energy counter resets | Reading as 16-bit instead of 32-bit | Use 2-register (32-bit or 64-bit) read for energy |
| Current reads half expected | CT ratio not configured | Enter correct CT ratio in meter settings |

## Commissioning Checklist

- [ ] Verify CT ratios match meter configuration
- [ ] Verify CT orientation (arrow toward load, or as marked)
- [ ] Compare meter voltage readings to handheld multimeter
- [ ] Compare meter current readings to clamp meter
- [ ] Verify power factor is positive (0.8-1.0 typical for resistive/motor loads)
- [ ] Verify energy accumulation over a known period
- [ ] Check communication: read all BACnet objects or Modbus registers
- [ ] Configure BAS trend logging for energy (kWh) at minimum 15-minute intervals
- [ ] Set up demand alarms (kW exceeds threshold)
- [ ] Verify pulse output count matches meter display (if applicable)
- [ ] Document CT ratios, meter serial numbers, and panel locations',
  (SELECT id FROM wiki_categories WHERE slug = 'how-to'),
  true
);

-- ============================================================
-- Article 5: LonWorks Network Troubleshooting for Building Automation
-- Gap: Protocol "LonWorks" facet has only 1 article
-- Sources:
--   - Continental Control Systems: LonWorks Network Troubleshooting (ctlsys.com)
--   - Schneider Electric Community: Troubleshooting Lon Communication Issues (community.se.com)
--   - Schneider Electric Community: FTT-10 LONWorks Network Design Rules (community.se.com)
--   - Echelon FTT-10A Free Topology Transceiver User Guide (echelon.com)
--   - Johnson Controls: LonWorks Network Integration with Network Engines (docs.johnsoncontrols.com)
-- ============================================================
INSERT INTO wiki_articles (title, slug, summary, content, category_id, is_published)
VALUES (
  'LonWorks Network Troubleshooting for Building Automation',
  'lonworks-network-troubleshooting-building-automation',
  'Troubleshooting guide for LonWorks (LON) network communication problems in building automation, including wiring diagnostics, node configuration, and diagnostic tools.',
  '## LonWorks Network Troubleshooting for Building Automation

LonWorks (LON) is a legacy but still prevalent networking protocol in building automation, used for HVAC controllers, lighting systems, and other field devices. Communication problems on LonWorks networks often stem from wiring issues, electromagnetic interference, or configuration errors. This guide provides systematic troubleshooting procedures.

## LonWorks FTT-10A Network Specifications

Before troubleshooting, know the network design limits for TP/FT-10 (the most common LonWorks medium in BAS):

| Parameter | Bus Topology | Free Topology |
|-----------|-------------|---------------|
| Max cable length | 1400m (4593 ft) | 500m (1640 ft) total wire |
| Max node-to-node distance | 1400m | 400m (1312 ft) |
| Max nodes per segment | 64 | 64 |
| Max nodes with repeater | 128 | 128 |
| Max stub length | 3m (10 ft) | N/A (free topology) |
| Termination | 2 terminators (one at each end) | 1 terminator |
| Cable type | Category 4+ twisted pair, 22 AWG | Category 4+ twisted pair, 22 AWG |
| Data rate | 78 kbps | 78 kbps |

(Source: Echelon FTT-10A User Guide, Schneider Electric FTT-10 Network Design Rules)

## Systematic Troubleshooting Procedure

### Step 1: Identify Symptoms

| Symptom | Likely Category |
|---------|----------------|
| All nodes offline | Physical layer fault or network manager issue |
| Single node offline | Node power, wiring, or configuration |
| Intermittent dropouts | Loose connections, interference, or overloaded network |
| Slow value updates | Network congestion or polling configuration |
| Node goes offline after time | Memory leak, heartbeat timeout, or power issue |

### Step 2: Check Physical Layer

**Power Supply:**
- Verify 24VAC or 24VDC power at each controller (per device spec)
- Check for voltage drop on long power runs
- Verify power supply capacity is not exceeded

**Wiring:**
- LON communication uses a twisted pair: wire to wire, polarity does not matter for FTT-10A
- Check for loose screw terminals — the FTT-10A transceiver will sometimes work with a loose connection, but reliability will be poor. This is a very common cause of intermittent communication.
- Verify cable is Category 4 or better twisted pair, 22 AWG minimum
- Check cable runs do not exceed topology limits (see table above)
- Verify stub lengths do not exceed 3m (10 ft) for bus topology

(Source: Continental Control Systems, Schneider Electric Community)

**Termination:**
- Bus topology requires terminators at **both ends** of the bus
- Free topology requires **one** terminator
- Echelon recommends double termination for any bus network using more than 500m (1640 ft) of cable
- Even shorter networks are more reliable with terminators installed
- Missing termination causes signal reflections and communication errors

(Source: Echelon FTT-10A User Guide)

### Step 3: Check for Electromagnetic Interference

LonWorks FTT-10A is susceptible to electromagnetic interference (EMI) from:
- Variable Frequency Drives (VFDs) — most common source
- Motor starters and contactors
- Power cables running parallel to LON wiring
- Fluorescent lighting ballasts

**Diagnostic clue:** Communication failures that correlate with specific equipment running (e.g., when a VFD starts, nodes drop offline) strongly indicate EMI.

**Solutions:**
- Separate LON wiring from power cables by at least 300mm (12 inches)
- Use shielded twisted pair cable
- Ground cable shield at one end only (avoid ground loops)
- Route LON wiring away from VFDs, motor starters, and switchgear
- If interference is severe, install a LON repeater to regenerate the signal

(Source: Continental Control Systems)

### Step 4: Verify Node Configuration

**In EcoStruxure Building Operation (Schneider):**

Use the Diagnostics tab under each controller to monitor:
- Device state (online, offline, unconfigured)
- Packet errors
- Transaction timeouts
- Receive transaction full errors
- Lost messages and missed messages
- Last reset cause
- Last error logged

(Source: Schneider Electric Community)

**In Metasys (Johnson Controls):**

LonWorks controllers managed through NAE/NIE Network Engines may show:
- Controller status: Online, Offline, or Communication Failed
- Check the LonWorks Interface (LCI) device status
- Verify the LON domain, subnet, and node ID match the system configuration

(Source: Johnson Controls LonWorks Network Integration Technical Bulletin)

### Step 5: Check Network Loading

LonWorks FTT-10A has a data rate of 78 kbps and uses CSMA (Carrier Sense Multiple Access) with collision avoidance. High traffic causes collisions and degraded performance.

**Rules of thumb:**
- Keep network utilization below 30% for reliable operation
- A long bus combined with many nodes (approaching 64) increases collision risk
- Reduce the number of nodes per segment if performance is poor
- Use a repeater or router to split a large network into smaller segments

**Signs of network congestion:**
- Slow value updates across many nodes
- Periodic communication timeouts
- Problems worsen when more devices are added

## Diagnostic Tools

| Tool | Vendor | Use |
|------|--------|-----|
| LonScanner Protocol Analyzer | Echelon/Dialog Semiconductor | Capture and decode LON packets; measure network utilization |
| LonMaker Integration Tool | Echelon/Dialog Semiconductor | Commission, configure, and diagnose LON networks |
| LonWorks Plug-in for Wireshark | Open source | Capture LON/IP packets on IP-852 networks |
| Multimeter | Any | Check continuity, voltage, and termination resistance |
| USB-to-LON adapter (U60) | Echelon | Connect laptop to TP/FT-10 network for diagnostics |

## Common Problems and Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| All nodes offline | LON interface card fault or missing power | Check LCI/LON card status; verify power to network |
| Single node offline | Bad wiring to that node | Check terminal connections; test continuity |
| Intermittent dropouts | Loose connection or EMI | Tighten terminals; separate from power cables |
| Node offline after VFD starts | EMI from VFD | Reroute LON cable; add shielding |
| Slow updates on all nodes | Network congestion (>30% utilization) | Split network with repeater/router; reduce polling |
| Node cannot be commissioned | Wrong domain or authentication key | Verify service pin; reset node to factory defaults |
| CRC errors in diagnostics | Cable fault or termination issue | Check cable integrity; verify terminators |
| Nodes work individually but fail together | Bus too long without termination | Add terminators at both ends |

## Migration Considerations

LonWorks is a mature protocol with declining vendor support. When planning upgrades:
- Many BAS platforms offer LonWorks-to-BACnet gateways for phased migration
- Niagara 4 supports LON through Tridium LON driver modules
- Consider replacing LON segments with BACnet MS/TP or BACnet/IP during major renovations
- Maintain spare LonWorks interface hardware for legacy support',
  (SELECT id FROM wiki_categories WHERE slug = 'troubleshooting'),
  true
);

-- ============================================================
-- Article 6: Lighting Control Integration with Building Automation
-- Gap: Topic "Lighting" facet has only 1 article
-- Sources:
--   - LOYTEC L-DALI BACnet/DALI Controllers (loytec.com)
--   - BACmove: DALI Essentials and Integration for Building Automation (bacmove.com)
--   - KNXhub: DALI Lighting Control Protocol (knxhub.com)
--   - KNXhub: DALI Gateways Integration with KNX, BACnet, IoT (knxhub.com)
--   - Lumos Controls: Lighting Control Protocols DALI 0-10V DMX PWM (lumoscontrols.com)
--   - AutomatedBuildings.com: Benefits of Lighting Control Integrating DALI and BACnet (automatedbuildings.com)
-- ============================================================
INSERT INTO wiki_articles (title, slug, summary, content, category_id, is_published)
VALUES (
  'Lighting Control Integration with Building Automation',
  'lighting-control-integration-building-automation',
  'Guide to integrating lighting control systems (DALI, 0-10V, relay) with building automation systems via BACnet, including protocol comparison, gateway selection, and commissioning.',
  '## Lighting Control Integration with Building Automation

Integrating lighting control with the building automation system (BAS) enables centralized scheduling, occupancy-based control, daylight harvesting, demand response, and energy monitoring. This guide covers the major lighting control protocols and how to integrate them with BACnet-based BAS.

## Lighting Control Protocol Comparison

| Feature | DALI (IEC 62386) | 0-10V | Relay | DMX512 | KNX |
|---------|-----------------|-------|-------|--------|-----|
| Signal Type | Digital | Analog | Discrete | Digital | Digital |
| Addressing | Individual (64 per bus) | Zone (all on one wire) | Zone (per relay circuit) | Individual (512 per universe) | Individual |
| Feedback | Yes (lamp status, faults) | No | No | Limited | Yes |
| Dimming Range | 0.1-100% | ~10-100% (varies) | On/Off only | 0-100% | 0-100% |
| Max Devices | 64 per DALI bus | Unlimited (parallel) | Per relay contacts | 512 per universe | 64,000+ |
| Wiring | 2-wire, polarity-free | 2-wire + common | Power wiring | 5-pin (or 3-pin) | Twisted pair |
| Scene Support | Yes (16 scenes per device) | No | No | Yes | Yes |
| Cost per Zone | Medium-High | Low | Low | Medium | High |
| Best For | Commercial offices, schools | Simple retrofit dimming | On/Off switching | Theaters, architectural | European installations |

(Source: Lumos Controls, KNXhub)

## DALI Integration with BACnet

DALI (Digital Addressable Lighting Interface, IEC 62386) is the most capable lighting protocol for BAS integration. Unlike 0-10V, DALI provides individual addressing, feedback, and scene control.

### DALI Architecture

```
BAS Controller ←→ BACnet/IP Network ←→ DALI-BACnet Gateway ←→ DALI Bus ←→ DALI Ballasts/Drivers
```

The DALI-BACnet gateway translates between protocols. Each DALI ballast or LED driver appears as one or more BACnet objects.

### BACnet Object Mapping for DALI

| DALI Function | BACnet Object | Notes |
|--------------|---------------|-------|
| Light Level (0-100%) | Analog Output (AO) | Write from BAS to dim |
| Actual Level Feedback | Analog Input (AI) | Read actual brightness |
| On/Off State | Binary Value (BV) | Read/write |
| Lamp Failure | Binary Input (BI) | Alarm: lamp needs replacement |
| Ballast Failure | Binary Input (BI) | Alarm: driver fault |
| Scene Recall | Multi-State Value (MSV) | Trigger DALI scenes (1-16) |
| Group Level | Analog Output (AO) | Control a group of lights |
| Occupancy Status | Binary Input (BI) | From DALI occupancy sensor |
| Light Level Sensor | Analog Input (AI) | From DALI light sensor (lux) |

(Source: BACmove DALI Essentials, LOYTEC L-DALI)

### DALI-BACnet Gateway Products

| Vendor | Product | DALI Buses | BACnet | Features |
|--------|---------|-----------|--------|----------|
| LOYTEC | L-DALI | 2 (128 devices) | BACnet/IP, MS/TP | Scheduling, trending, alarming (AST) built-in |
| BACmove | DALION | 1 (64 devices) | BACnet/IP | BTL Listed; scheduling, scenes |
| Intesis | DALI to BACnet | 1 (64 devices) | BACnet/IP | Compact; web configuration |
| Philips | SpaceWise/Interact | Varies | BACnet/IP | Enterprise-scale; analytics |

(Source: LOYTEC, BACmove, AutomatedBuildings.com)

### DALI Integration Considerations

**Performance:**
- DALI is a slow protocol (1200 bps) — commanding all 64 devices individually takes several seconds
- DALI-BACnet gateways cache DALI feedback data and respond to BACnet reads from cache, not from live DALI queries
- Use DALI groups for simultaneous control; group commands are received by all members at once

**Wiring:**
- DALI bus is 2-wire, polarity-free
- Max cable length: 300m (984 ft) with max 2V voltage drop
- DALI bus power supply provides 16V DC to the bus (separate from fixture power)
- DALI wiring can share conduit with mains power but must be rated for it

(Source: KNXhub, BACmove)

## 0-10V Integration

0-10V is the simplest analog dimming method, widely used in North America for LED and fluorescent dimming.

### How 0-10V Works

- The BAS controller outputs a 0-10V analog signal to the dimming ballast/driver
- 10V = full brightness (100%), 0V-1V = minimum brightness or off
- Each "zone" requires a separate 0-10V signal wire
- **No feedback** — the BAS cannot confirm the actual light level

### BAS Controller Wiring

| Controller Output | Connection |
|------------------|------------|
| Analog Output (0-10V) | + to dim input, - to dim common |
| Digital Output (relay) | Switches fixture power on/off |

> **Important:** Most 0-10V LED drivers do not turn off at 0V — they dim to their minimum level (typically 5-10%). A separate relay is needed to switch the fixture completely off. The BAS should open the relay for Off and energize it for On before applying the 0-10V dim level.

### 0-10V Limitations

- No individual addressing — all fixtures on one wire dim together
- No feedback or fault detection
- Analog signal is susceptible to voltage drop on long runs
- Maximum cable length depends on current draw; typically 150m (500 ft)
- Adding zones requires additional AO points and wiring

## Relay-Based Lighting Control

For on/off lighting (stairwells, parking garages, utility spaces), the BAS controls lighting circuits through relays or lighting control panels.

### Lighting Control Panel Integration

Lighting relay panels (e.g., from GE, Eaton, Leviton) can be integrated via:
- **BACnet MS/TP** — Panel has built-in BACnet interface
- **Modbus RTU** — Panel communicates register-based on/off commands
- **Dry contact inputs** — BAS relay output wired to panel digital input
- **LonWorks** — Legacy panels with LON interface

### BACnet Object Mapping for Relay Panels

| Function | BACnet Object | Notes |
|----------|---------------|-------|
| Circuit On/Off | Binary Output (BO) | Write to control circuit relay |
| Circuit Status | Binary Input (BI) | Read to confirm relay state |
| Schedule Override | Binary Value (BV) | Manual override from panel |

## Daylight Harvesting Integration

Daylight harvesting uses ambient light sensors to reduce artificial lighting when natural light is sufficient.

### Implementation with BAS

1. Mount photosensor(s) to measure ambient light (lux)
2. Photosensor connects to BAS via AI (analog) or DALI (digital)
3. BAS compares measured lux to target setpoint
4. BAS adjusts dimming output (0-10V or DALI) to maintain target lux
5. Use a slow response time (30-60 second ramp) to avoid noticeable changes

### Typical Lux Targets (per IES Lighting Handbook)

| Space Type | Target Illuminance |
|-----------|-------------------|
| Open office | 300-500 lux |
| Private office | 300-500 lux |
| Conference room | 300-500 lux |
| Corridor | 50-100 lux |
| Lobby | 100-200 lux |
| Parking garage | 50-100 lux |
| Classroom | 300-500 lux |

(Source: IES Lighting Handbook, 10th Edition)

## Commissioning Checklist

- [ ] Verify all lighting circuits respond to BAS commands (on/off, dim)
- [ ] Test DALI individual addressing — confirm each fixture address is correct
- [ ] Verify DALI gateway reports lamp and ballast fault status
- [ ] Test 0-10V dimming across full range (0-100%)
- [ ] Confirm relay-controlled circuits switch correctly
- [ ] Verify occupancy sensor integration (occupied/unoccupied response)
- [ ] Test daylight harvesting — cover sensor to simulate darkness; verify lights increase
- [ ] Test scheduling — verify time-based on/off/dim scenes
- [ ] Verify override buttons/switches function and time out correctly
- [ ] Test demand response curtailment — reduce lighting by 10-30% on command
- [ ] Document all DALI addresses, group assignments, and scene configurations',
  (SELECT id FROM wiki_categories WHERE slug = 'how-to'),
  true
);

-- ============================================================
-- Now link articles to facets
-- ============================================================

-- Article 1: Modbus Troubleshooting Guide
-- Facets: Modbus (protocol), troubleshooting (topic), Integration (topic)
INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'modbus-troubleshooting-guide-bas-technicians'
  AND f.slug = 'modbus';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'modbus-troubleshooting-guide-bas-technicians'
  AND f.slug = 'troubleshooting';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'modbus-troubleshooting-guide-bas-technicians'
  AND f.slug = 'integration';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'modbus-troubleshooting-guide-bas-technicians'
  AND f.slug = 'networking';

-- Article 2: OPC UA Integration Guide
-- Facets: OPC UA (protocol), Integration (topic), security (topic)
INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'opc-ua-integration-guide-building-automation'
  AND f.slug = 'opc-ua';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'opc-ua-integration-guide-building-automation'
  AND f.slug = 'integration';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'opc-ua-integration-guide-building-automation'
  AND f.slug = 'security'
  AND f.group_id = (SELECT id FROM wiki_facet_groups WHERE slug = 'topic');

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'opc-ua-integration-guide-building-automation'
  AND f.slug = 'bacnet';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'opc-ua-integration-guide-building-automation'
  AND f.slug = 'guide';

-- Article 3: VFD Integration Guide
-- Facets: VFD (topic), Modbus (protocol), BACnet (protocol), Integration (topic), commissioning (topic)
INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'vfd-integration-building-automation-systems'
  AND f.slug = 'vfd';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'vfd-integration-building-automation-systems'
  AND f.slug = 'modbus';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'vfd-integration-building-automation-systems'
  AND f.slug = 'bacnet';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'vfd-integration-building-automation-systems'
  AND f.slug = 'integration';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'vfd-integration-building-automation-systems'
  AND f.slug = 'commissioning';

-- Article 4: Energy Metering Integration
-- Facets: Meters (topic), Modbus (protocol), BACnet (protocol), Integration (topic)
INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'energy-metering-integration-building-automation'
  AND f.slug = 'meters';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'energy-metering-integration-building-automation'
  AND f.slug = 'modbus';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'energy-metering-integration-building-automation'
  AND f.slug = 'bacnet';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'energy-metering-integration-building-automation'
  AND f.slug = 'integration';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'energy-metering-integration-building-automation'
  AND f.slug = 'analytics';

-- Article 5: LonWorks Troubleshooting Guide
-- Facets: LonWorks (protocol), troubleshooting (topic), networking (topic)
INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lonworks-network-troubleshooting-building-automation'
  AND f.slug = 'lonworks';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lonworks-network-troubleshooting-building-automation'
  AND f.slug = 'troubleshooting';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lonworks-network-troubleshooting-building-automation'
  AND f.slug = 'networking'
  AND f.group_id = (SELECT id FROM wiki_facet_groups WHERE slug = 'topic');

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lonworks-network-troubleshooting-building-automation'
  AND f.slug = 'integration';

-- Article 6: Lighting Control Integration
-- Facets: Lighting (topic), Integration (topic), Graphics (topic), commissioning (topic)
INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lighting-control-integration-building-automation'
  AND f.slug = 'lighting';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lighting-control-integration-building-automation'
  AND f.slug = 'integration';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lighting-control-integration-building-automation'
  AND f.slug = 'commissioning';

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT a.id, f.id
FROM wiki_articles a, wiki_facets f
WHERE a.slug = 'lighting-control-integration-building-automation'
  AND f.slug = 'guide';
