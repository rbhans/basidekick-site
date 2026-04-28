-- Add wiki articles to fill content gaps: Modbus integration and BACnet object reference.
-- Sources cited inline per article.

-- New tags
INSERT INTO wiki_tags (name, slug)
VALUES
  ('modbus', 'modbus'),
  ('rs-485', 'rs-485'),
  ('hvac', 'hvac'),
  ('energy-metering', 'energy-metering'),
  ('vfd', 'vfd'),
  ('alarms', 'alarms')
ON CONFLICT (slug) DO NOTHING;

-- New facets for the new tags
INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, 'modbus', 'modbus', 10
FROM wiki_facet_groups g WHERE g.slug = 'protocol'
ON CONFLICT (group_id, slug) DO NOTHING;

INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, 'rs-485', 'rs-485', 11
FROM wiki_facet_groups g WHERE g.slug = 'protocol'
ON CONFLICT (group_id, slug) DO NOTHING;

INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, 'vfd', 'vfd', 30
FROM wiki_facet_groups g WHERE g.slug = 'topic'
ON CONFLICT (group_id, slug) DO NOTHING;

INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, 'alarms', 'alarms', 31
FROM wiki_facet_groups g WHERE g.slug = 'topic'
ON CONFLICT (group_id, slug) DO NOTHING;

INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, 'energy-metering', 'energy-metering', 32
FROM wiki_facet_groups g WHERE g.slug = 'topic'
ON CONFLICT (group_id, slug) DO NOTHING;

INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, 'hvac', 'hvac', 33
FROM wiki_facet_groups g WHERE g.slug = 'topic'
ON CONFLICT (group_id, slug) DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 1: Modbus RTU and TCP Integration in Building Automation
-- Category: How-To
-- Sources:
--   Modbus Organization, "MODBUS Protocol Specifications" (modbus.org/specs.php)
--   Modbus Wikipedia (en.wikipedia.org/wiki/Modbus)
--   NI, "The Modbus Protocol In-Depth" (ni.com)
--   Modbus.app, "Modbus Function Codes — Complete Reference Table"
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'how-to'),
  'Modbus RTU and TCP Integration in Building Automation',
  'modbus-rtu-tcp-integration-building-automation',
  'Practical guide to integrating Modbus RTU and Modbus TCP devices into a BAS, covering register types, function codes, wiring, and gateway configuration.',
  E'# Modbus RTU and TCP Integration in Building Automation\n\nModbus is one of the most widely deployed serial communication protocols in building automation. Originally developed by Modicon (now Schneider Electric) in 1979, it remains the default integration protocol for power meters, variable frequency drives, boilers, chillers, and many other field devices.\n\nThis guide covers the two variants used in BAS: Modbus RTU (serial RS-485) and Modbus TCP (Ethernet).\n\n## Protocol Fundamentals\n\nModbus uses a master/slave (client/server) architecture:\n\n- One master device polls slave devices for data\n- Slaves respond only when polled — they never initiate communication\n- Each slave has a unique address from 1 to 247 on a given serial bus\n- Modbus TCP uses standard IP addressing instead of slave addresses\n\n## Register Types\n\nModbus defines four register types, each mapped to specific function codes:\n\n| Register Type | Address Range | Access | Size | Typical Use |\n|---|---|---|---|---|\n| Coils | 00001–09999 | Read/Write | 1 bit | Digital outputs, commands |\n| Discrete Inputs | 10001–19999 | Read Only | 1 bit | Digital inputs, status |\n| Input Registers | 30001–39999 | Read Only | 16 bit | Analog inputs, measurements |\n| Holding Registers | 40001–49999 | Read/Write | 16 bit | Setpoints, configuration |\n\nSource: Modbus Organization, MODBUS Application Protocol Specification V1.1b3 (modbus.org)\n\n## Common Function Codes\n\n| Code | Name | Purpose |\n|---|---|---|\n| 01 (0x01) | Read Coils | Read 1-bit digital outputs |\n| 02 (0x02) | Read Discrete Inputs | Read 1-bit digital inputs |\n| 03 (0x03) | Read Holding Registers | Read 16-bit read/write registers |\n| 04 (0x04) | Read Input Registers | Read 16-bit read-only registers |\n| 05 (0x05) | Write Single Coil | Write one digital output |\n| 06 (0x06) | Write Single Register | Write one holding register |\n| 15 (0x0F) | Write Multiple Coils | Write multiple digital outputs |\n| 16 (0x10) | Write Multiple Registers | Write multiple holding registers |\n\nSource: Modbus.app Function Code Reference; Modbus Organization specification\n\n## Modbus RTU: RS-485 Wiring\n\nModbus RTU communicates over RS-485 serial:\n\n- Use shielded twisted pair cable\n- Wire in daisy-chain topology — no star or T-tap configurations\n- Maximum 32 devices per segment (without repeaters)\n- Maximum cable length: 1200 meters (4000 feet) at 9600 baud\n- Install 120 ohm termination resistors at both physical ends of the bus\n- Connect signal common (ground reference) between all devices\n- Ground the shield at one end only to prevent ground loops\n\nSource: Modbus over Serial Line Specification V1.02 (modbus.org); TIA/EIA-485 standard\n\n## Modbus RTU Communication Settings\n\nAll devices on a bus must share identical settings:\n\n| Parameter | Common Values |\n|---|---|\n| Baud rate | 9600, 19200, 38400 |\n| Data bits | 8 |\n| Parity | None or Even |\n| Stop bits | 1 (with parity) or 2 (without parity) |\n| Slave address | 1–247 (unique per device) |\n\nThe Modbus RTU specification defines a default of 19200 baud, 8 data bits, even parity, and 1 stop bit.\n\nSource: Modbus over Serial Line Specification V1.02 (modbus.org)\n\n## Modbus TCP: Ethernet-Based\n\nModbus TCP wraps Modbus frames in TCP/IP packets:\n\n- Standard port: TCP 502\n- Uses IP addresses instead of slave addresses\n- No RS-485 wiring constraints\n- Supports multiple simultaneous connections\n- No termination or polarity concerns\n- Unit Identifier field maps to the slave address (for gateway scenarios)\n\nSource: Modbus Organization, MODBUS Messaging on TCP/IP Implementation Guide V1.0b (modbus.org)\n\n## Data Interpretation\n\nModbus registers are 16-bit values. Larger data types use multiple consecutive registers:\n\n| Data Type | Registers | Notes |\n|---|---|---|\n| 16-bit integer | 1 | Signed (−32768 to 32767) or unsigned (0 to 65535) |\n| 32-bit integer | 2 | Check byte order: Big Endian vs Little Endian |\n| 32-bit float (IEEE 754) | 2 | Check word order: AB CD vs CD AB |\n| 64-bit double | 4 | Rare in BAS devices |\n\nByte order (endianness) varies by manufacturer. Always verify with the device register map.\n\n## BAS Integration Steps\n\n1. Obtain the device Modbus register map from the manufacturer\n2. Confirm communication settings (baud, parity, address for RTU; IP and port for TCP)\n3. Configure the BAS controller Modbus driver (RTU serial port or TCP client)\n4. Map device registers to BAS points with correct data types and scaling\n5. Verify readings against the device local display or a known reference\n6. Set appropriate polling intervals (typically 5–30 seconds for HVAC devices)\n\n## Modbus-to-BACnet Gateways\n\nWhen the BAS controller does not support Modbus natively, use a protocol gateway:\n\n- Gateway reads Modbus registers and exposes them as BACnet objects\n- Configure register-to-object mappings in the gateway\n- Gateways introduce latency — account for this in control sequences\n- Confirm the gateway supports your required function codes and register counts\n\n## Common BAS Devices Using Modbus\n\n| Device Type | Typical Protocol | Common Registers |\n|---|---|---|\n| Power meters | Modbus RTU or TCP | Voltage, current, kW, kWh, power factor |\n| VFDs | Modbus RTU | Speed command, speed feedback, status, fault code |\n| Boilers | Modbus RTU | Firing rate, supply temp, status, alarms |\n| Chillers | Modbus TCP | Entering/leaving water temp, capacity, status |\n| Generator controllers | Modbus RTU or TCP | Run status, voltage, frequency, alarms |\n\n## References\n\n- Modbus Organization, MODBUS Application Protocol Specification V1.1b3\n- Modbus Organization, MODBUS over Serial Line Specification V1.02\n- Modbus Organization, MODBUS Messaging on TCP/IP Implementation Guide V1.0b\n- TIA/EIA-485 Standard (RS-485 physical layer)',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'modbus-rtu-tcp-integration-building-automation'),
  id
FROM wiki_tags WHERE slug IN ('modbus', 'rs-485', 'protocols', 'integration', 'networking')
ON CONFLICT DO NOTHING;

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'modbus-rtu-tcp-integration-building-automation'),
  f.id
FROM wiki_facets f WHERE f.slug IN ('modbus', 'rs-485', 'networking', 'integration')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 2: BACnet Object Types Quick Reference
-- Category: Reference (fills the empty Reference category)
-- Sources:
--   ASHRAE Standard 135-2020 (ANSI/ASHRAE 135)
--   BACnet International (bacnet.org)
--   BACnet Wikipedia (en.wikipedia.org/wiki/BACnet)
--   ASHRAE Standard 135 Resource Files (data.ashrae.org/bacnet/)
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'reference'),
  'BACnet Object Types Quick Reference',
  'bacnet-object-types-quick-reference',
  'Concise reference for the most commonly used BACnet object types in building automation, including properties, use cases, and practical notes per ASHRAE 135.',
  E'# BACnet Object Types Quick Reference\n\nBACnet (ASHRAE Standard 135) models every device as a collection of objects whose properties represent hardware, software, and operational state. ASHRAE 135-2020 defines over 60 standard object types. This reference covers the ones encountered most often in BAS fieldwork.\n\n## Core I/O Object Types\n\n| Object Type | Abbr | Access | Typical Use |\n|---|---|---|---|\n| Analog Input | AI | Read | Physical sensor: temperature, pressure, humidity |\n| Analog Output | AO | Read/Write | Physical actuator: valve, damper position command |\n| Analog Value | AV | Read/Write | Internal calculated or setpoint value |\n| Binary Input | BI | Read | Physical status: switch, proof-of-flow, alarm contact |\n| Binary Output | BO | Read/Write | Physical command: fan start/stop, relay |\n| Binary Value | BV | Read/Write | Internal logical flag or mode |\n| Multi-State Input | MSI | Read | Equipment mode or state with >2 states |\n| Multi-State Output | MSO | Read/Write | Multi-position command (e.g. fan speed stage) |\n| Multi-State Value | MSV | Read/Write | Internal mode selection |\n\nSource: ASHRAE 135-2020, Clause 12\n\n## Key Properties (Common to Most Objects)\n\n| Property | Description |\n|---|---|\n| Object_Identifier | Unique ID within the device (type + instance number) |\n| Object_Name | Human-readable name (must be unique within the device) |\n| Object_Type | Enumerated type (Analog Input, Binary Output, etc.) |\n| Present_Value | Current value of the object |\n| Status_Flags | Four flags: In_Alarm, Fault, Overridden, Out_Of_Service |\n| Units | Engineering units (degrees-Fahrenheit, percent, etc.) |\n| Description | Optional text description |\n| Priority_Array | 16-level priority array for commandable objects |\n| Reliability | Indicates sensor or communication reliability status |\n\nSource: ASHRAE 135-2020, Clause 12\n\n## Priority Array (Commandable Objects)\n\nCommandable objects (AO, AV, BO, BV, MSO, MSV) use a 16-level priority array. Lower numbers have higher priority:\n\n| Priority | Intended Use |\n|---|---|\n| 1 | Manual-Life Safety |\n| 2 | Automatic-Life Safety |\n| 3 | Available |\n| 4 | Available |\n| 5 | Critical Equipment Control |\n| 6 | Minimum On/Off |\n| 7 | Available |\n| 8 | Manual Operator (typical for operator overrides) |\n| 9 | Available |\n| 10 | Available |\n| 11 | Available |\n| 12 | Available |\n| 13 | Available |\n| 14 | Available |\n| 15 | Available |\n| 16 | Default / Relinquish Default |\n\nSource: ASHRAE 135-2020, Clause 19\n\n## Scheduling and Calendar Objects\n\n| Object Type | Purpose |\n|---|---|\n| Schedule | Time-based value changes (occupied/unoccupied, setpoints) |\n| Calendar | Date-based exceptions (holidays, special events) |\n\nSchedule objects reference Calendar objects for exception scheduling. Both are defined in ASHRAE 135-2020, Clause 12.\n\n## Trending and Logging Objects\n\n| Object Type | Purpose |\n|---|---|\n| Trend Log | Records historical values of a specified object property at defined intervals or on COV |\n| Trend Log Multiple | Records multiple properties in a single log |\n| Event Log | Records event/alarm notifications |\n\nSource: ASHRAE 135-2020, Clause 12\n\n## Alarm and Event Objects\n\n| Object Type | Purpose |\n|---|---|\n| Notification Class | Defines alarm routing: who gets notified and at what priority |\n| Event Enrollment | Monitors a property and generates events based on defined conditions |\n| Life Safety Point | Fire/smoke detector status point |\n| Life Safety Zone | Aggregates Life Safety Points into zones |\n\nSource: ASHRAE 135-2020, Clause 12 and Clause 13\n\n## Metering Objects\n\n| Object Type | Purpose |\n|---|---|\n| Accumulator | Pulse-counting meter input with guaranteed accuracy for billing (added in Addendum d to 135-2001) |\n| Pulse Converter | Pulse-counting input without billing-grade accuracy guarantee |\n\nSource: ANSI/ASHRAE Addendum d to Standard 135-2001; ASHRAE 135-2020\n\n## Device Object\n\nEvery BACnet device must contain exactly one Device object. Key properties:\n\n| Property | Description |\n|---|---|\n| Object_Identifier | The device instance number (must be unique across the entire BACnet network) |\n| System_Status | Operational, download-required, non-operational, etc. |\n| Vendor_Name | Manufacturer name |\n| Model_Name | Device model |\n| Firmware_Revision | Current firmware version |\n| Protocol_Version | BACnet protocol version supported |\n| Protocol_Revision | BACnet protocol revision supported |\n| Max_APDU_Length_Accepted | Maximum message size the device can handle |\n| Segmentation_Supported | Whether the device supports message segmentation |\n\nSource: ASHRAE 135-2020, Clause 12.11\n\n## Other Commonly Encountered Objects\n\n| Object Type | Purpose |\n|---|---|\n| Loop | PID control loop with setpoint, process variable, and output |\n| Program | Represents a program running inside the device |\n| File | Provides access to files stored on the device |\n| Averaging | Computes min, max, and average of a monitored property |\n| Command | Groups multiple property writes into a single action |\n| Network Port | Represents a physical or virtual network interface |\n| Structured View | Organizes objects into logical groups for navigation |\n\nSource: ASHRAE 135-2020, Clause 12\n\n## Practical Notes\n\n- Device instance numbers must be unique across the entire BACnet internetwork, not just per segment\n- Object names must be unique within a single device\n- When commissioning, always verify that engineering units match the physical sensor range\n- Priority 8 is the conventional level for operator overrides in most BAS implementations\n- COV (Change of Value) subscriptions reduce network traffic compared to continuous polling but require device support\n\n## References\n\n- ASHRAE Standard 135-2020: BACnet — A Data Communication Protocol for Building Automation and Control Networks\n- ANSI/ASHRAE Addendum d to Standard 135-2001 (Accumulator and Pulse Converter objects)\n- BACnet International (bacnet.org)\n- ASHRAE Standard 135 Resource Files (data.ashrae.org/bacnet/)',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'bacnet-object-types-quick-reference'),
  id
FROM wiki_tags WHERE slug IN ('bacnet', 'protocols', 'best-practices', 'commissioning')
ON CONFLICT DO NOTHING;

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'bacnet-object-types-quick-reference'),
  f.id
FROM wiki_facets f WHERE f.slug IN ('bacnet', 'commissioning')
ON CONFLICT DO NOTHING;

-- Update facet article counts
UPDATE wiki_facets f
SET article_count = COALESCE(counts.cnt, 0)
FROM (
  SELECT facet_id, COUNT(*) as cnt
  FROM wiki_article_facets
  GROUP BY facet_id
) counts
WHERE f.id = counts.facet_id;
