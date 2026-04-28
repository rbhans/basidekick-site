-- Wiki gap articles batch 2: Modbus troubleshooting and VFD integration.

-----------------------------------------------------------------------
-- ARTICLE 3: Modbus RTU Troubleshooting: RS-485 Wiring and Communication
-- Category: Troubleshooting
-- Sources:
--   Modbus Organization, MODBUS over Serial Line Specification V1.02
--   TIA/EIA-485 Standard
--   Campbell Scientific, "Modbus Troubleshooting Guide"
--   Produal, "Tips to avoid communication problems in RS-485 networks"
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'troubleshooting'),
  'Modbus RTU Troubleshooting: RS-485 Wiring and Communication',
  'modbus-rtu-troubleshooting-rs485-wiring',
  'Field troubleshooting checklist for Modbus RTU over RS-485 covering wiring faults, termination, polarity, communication settings, and common error patterns.',
  E'# Modbus RTU Troubleshooting: RS-485 Wiring and Communication\n\nModbus RTU communication failures in the field are almost always caused by physical wiring and configuration issues rather than software bugs. This checklist provides a systematic approach to diagnosing and resolving RS-485 communication problems.\n\n## Problem\n\nModbus RTU devices fail to respond, respond intermittently, or return corrupted data. The BAS controller logs timeout errors, CRC errors, or no response from one or more slave addresses.\n\n## Common Root Causes\n\n| Cause | Frequency | Impact |\n|---|---|---|\n| Reversed polarity (A/B swapped) | Very common | Complete communication failure |\n| Missing or extra termination | Common | Intermittent errors, CRC failures |\n| Star or T-tap wiring | Common | Reflections, data corruption |\n| Mismatched baud rate or parity | Common | No response from devices |\n| Missing signal common wire | Common | Intermittent failures, noise |\n| Duplicate slave addresses | Occasional | Garbled responses, bus contention |\n| Cable too long for baud rate | Occasional | Increasing error rate with distance |\n| Ground loop from shield grounding | Occasional | Noise-induced errors |\n\n## Step A: Verify Communication Settings\n\nAll devices on the bus must share identical serial parameters:\n\n- Baud rate (9600, 19200, 38400 are most common in BAS)\n- Data bits (almost always 8)\n- Parity (None or Even — check device default)\n- Stop bits (1 with parity, 2 without parity per Modbus spec)\n\nThe Modbus over Serial Line specification (V1.02, Section 2.5.1) defines the default as 19200 baud, 8 data bits, even parity, 1 stop bit. Many BAS devices ship with 9600/8/N/2 instead — always check the device manual.\n\nSource: Modbus Organization, MODBUS over Serial Line Specification V1.02\n\n## Step B: Check Slave Addresses\n\n- Every device on the bus must have a unique slave address (1–247)\n- Address 0 is reserved for broadcast (no response expected)\n- Duplicate addresses cause bus contention and garbled responses\n- Document all addresses before troubleshooting\n\n## Step C: Inspect Wiring Topology\n\nRS-485 requires daisy-chain (bus) topology:\n\n- Cable runs from master to first slave, continues to next slave, and so on\n- No star connections, no T-taps, no stubs longer than a few inches\n- Star or stub wiring causes signal reflections that corrupt data\n\nSource: TIA/EIA-485 Standard\n\n## Step D: Verify Polarity\n\n- RS-485 uses a differential pair: A (−) and B (+) on most devices\n- Reversing A and B on any device causes that device to fail and can disrupt the entire bus\n- Polarity labeling is inconsistent across manufacturers: some label D+ and D−, others use A and B with reversed conventions\n- If in doubt, try swapping the two data wires on the problem device\n\nSource: Modbus over Serial Line Specification V1.02, Section 3.2\n\n## Step E: Check Termination\n\nInstall 120 ohm termination resistors at the two physical ends of the bus only:\n\n- With the bus powered down, measure resistance between A and B at one end\n- Two 120 ohm resistors in parallel reads approximately 60 ohms\n- Much lower: possible short or extra terminators in the middle\n- Very high or open: missing termination or broken cable\n- Never terminate at intermediate devices\n\nSource: TIA/EIA-485 Standard; Modbus over Serial Line Specification V1.02\n\n## Step F: Verify Signal Common\n\nThe third wire (signal common / reference ground) is required:\n\n- RS-485 is differential but still needs a ground reference\n- Missing common causes the receiver to operate outside its common-mode voltage range\n- Connect the common terminal on all devices on the bus\n\nSource: TIA/EIA-485 Standard\n\n## Step G: Check Shield and Grounding\n\n- Use shielded twisted pair cable\n- Ground the shield drain wire at one end of the bus only\n- Grounding both ends creates a ground loop that introduces noise\n- Keep RS-485 cable physically separated from power wiring and VFD output cables\n\n## Step H: Interpret Error Patterns\n\n| Error Pattern | Likely Cause |\n|---|---|\n| No response from any device | Wrong COM port, wrong baud/parity, cable not connected |\n| No response from one device | Wrong slave address, reversed polarity on that device, device offline |\n| CRC errors | Noise, missing termination, star wiring, baud mismatch |\n| Intermittent timeouts | Marginal termination, cable length near limit, loose connections |\n| Responses from wrong address | Duplicate slave addresses on the bus |\n| All devices fail after adding one | New device has extra termination enabled, polarity reversed, or address conflict |\n\n## Step I: Isolation by Bisection\n\nFor buses with many devices:\n\n1. Disconnect the bus at the midpoint\n2. Test each half independently\n3. The stable half is clear; continue bisecting the problem half\n4. Repeat until the faulty device or cable segment is isolated\n\n## Cable Length vs Baud Rate\n\n| Baud Rate | Practical Max Length |\n|---|---|\n| 9600 | 1200 m (4000 ft) |\n| 19200 | 1200 m (4000 ft) |\n| 38400 | 600 m (2000 ft) |\n| 115200 | 300 m (1000 ft) |\n\nFor runs exceeding these limits, add an RS-485 repeater to create a new segment.\n\nSource: TIA/EIA-485 Standard guidelines\n\n## References\n\n- Modbus Organization, MODBUS over Serial Line Specification V1.02\n- TIA/EIA-485 Standard (RS-485 Physical Layer)\n- Campbell Scientific, Modbus Troubleshooting Guide\n- Produal, Tips to Avoid Communication Problems in RS-485 Networks',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'modbus-rtu-troubleshooting-rs485-wiring'),
  id
FROM wiki_tags WHERE slug IN ('modbus', 'rs-485', 'troubleshooting', 'networking', 'protocols')
ON CONFLICT DO NOTHING;

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'modbus-rtu-troubleshooting-rs485-wiring'),
  f.id
FROM wiki_facets f WHERE f.slug IN ('modbus', 'rs-485', 'networking', 'troubleshooting')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 4: VFD Integration over BACnet in Building Automation
-- Category: How-To
-- Sources:
--   ASHRAE Standard 135-2020
--   ABB, "BACnet Protocol ACH550 AC Drives" (library.e.abb.com)
--   Danfoss, "VLT HVAC Drive BACnet Operating Instructions"
--   Consulting-Specifying Engineer, "BACnet control points and devices"
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'how-to'),
  'VFD Integration over BACnet in Building Automation',
  'vfd-integration-bacnet-building-automation',
  'How to integrate variable frequency drives into a BAS over BACnet MS/TP or BACnet/IP, covering point mapping, wiring, and commissioning best practices.',
  E'# VFD Integration over BACnet in Building Automation\n\nVariable frequency drives (VFDs) control the speed of fan and pump motors in HVAC systems and are among the most common BACnet-integrated devices on a BAS network. Most HVAC-rated VFDs include BACnet MS/TP as a standard or optional communication card.\n\n## Integration Architecture\n\nVFDs typically connect to the BAS via BACnet MS/TP on the same RS-485 trunk as other controllers, or via BACnet/IP on the building Ethernet network.\n\n| Connection | Pros | Cons |\n|---|---|---|\n| BACnet MS/TP | Simple wiring, widely supported | Limited bandwidth, daisy-chain required |\n| BACnet/IP | Faster, allows remote access | Requires Ethernet infrastructure to each VFD |\n| Hardwired + BACnet | Critical points hardwired, monitoring via BACnet | More wiring, but safest for critical control |\n\nSource: Consulting-Specifying Engineer, "BACnet Control Points and Devices in BAS"\n\n## Recommended Point Mapping\n\nA typical VFD BACnet integration includes these points:\n\n### Essential Points (Minimum Integration)\n\n| BACnet Object | Point | Direction | Notes |\n|---|---|---|---|\n| BO or BV | Start/Stop Command | BAS → VFD | Run command from controller |\n| BI or BV | Run Status | VFD → BAS | Confirms motor is running |\n| AO or AV | Speed Reference | BAS → VFD | Speed command (0–100% or Hz) |\n| AI or AV | Speed Feedback | VFD → BAS | Actual motor speed |\n| BI or BV | Fault Status | VFD → BAS | Drive fault alarm |\n\n### Extended Monitoring Points\n\n| BACnet Object | Point | Notes |\n|---|---|---|\n| AI | Output Current | Motor amps for loading assessment |\n| AI | Output Frequency | Actual output Hz |\n| AI | DC Bus Voltage | Drive health indicator |\n| AI | Motor Temperature | If thermal sensor is wired |\n| MSI | Fault Code | Specific fault identification |\n| AI | Power Consumption | kW if supported by VFD |\n| AI | Energy Total | kWh accumulator |\n\nSource: ABB, BACnet Protocol ACH550 Operating Instructions; Danfoss, VLT HVAC Drive BACnet Manual\n\n## Hardwired vs Network Control\n\nIndustry best practice is to hardwire safety-critical points and use the network for monitoring and non-critical control:\n\n| Point | Recommended Method | Rationale |\n|---|---|---|\n| Start/Stop | Hardwired (DO from controller) | Maintains control if network fails |\n| Speed Reference | Hardwired (AO 0–10V or 4–20mA) | Maintains speed control if network fails |\n| Run Status | Hardwired (DI proof of flow) | Independent safety verification |\n| Fault Status | Hardwired (DI) | Alarm even without network |\n| All monitoring points | BACnet network | Additional data; no safety impact |\n\nThis hybrid approach ensures the HVAC system continues to operate during a network outage.\n\nSource: Consulting-Specifying Engineer, BACnet integration guidance\n\n## BACnet MS/TP Configuration\n\n### VFD-Side Settings\n\n1. Install or enable the BACnet MS/TP communication card\n2. Set a unique MAC address (0–127, but 0–63 recommended for masters)\n3. Set the baud rate to match the trunk (typically 38400 or 76800)\n4. Set the BACnet device instance (must be unique across the entire network)\n5. Set the BACnet network number if required\n\n### Wiring\n\n- Connect to the existing BACnet MS/TP daisy-chain trunk\n- Use shielded twisted pair; maintain consistent polarity\n- Keep VFD communication wiring physically separated from VFD power output cables to avoid electromagnetic interference\n- If the VFD is the last device on the trunk, enable or install the 120 ohm termination resistor\n\nSource: ASHRAE Standard 135-2020 (Annex H: BACnet MS/TP); ABB ACH550 BACnet documentation\n\n## Commissioning Checklist\n\n1. Verify the VFD responds to a BACnet Who-Is request with the correct device instance\n2. Read all mapped BACnet objects and confirm values are reasonable\n3. Command Start via BACnet — confirm motor starts and Run Status updates\n4. Command a speed change — confirm Speed Feedback tracks the reference\n5. Command Stop — confirm motor stops\n6. Simulate or trigger a drive fault — confirm Fault Status and Fault Code propagate to the BAS\n7. Disconnect the BACnet cable — confirm the VFD enters its configured network-loss behavior (typically stop or hold last speed)\n8. Verify priority array levels are correct (operator override vs automatic control)\n9. Test the hardwired fallback path if applicable\n\n## Common Issues\n\n| Issue | Cause | Resolution |\n|---|---|---|\n| VFD not discovered | Wrong MAC address, baud, or network number | Match settings to trunk |\n| Speed command has no effect | VFD not in remote/auto mode | Set VFD local/remote switch to remote |\n| Fault code reads 0 but VFD is faulted | Wrong BACnet object mapped | Check VFD register map for correct fault object |\n| Speed oscillates | PID loop conflict between BAS and VFD | Disable VFD internal PID; let BAS control |\n| Communication drops near VFD | EMI from VFD output cables | Separate comm wiring; use shielded cable |\n\n## References\n\n- ASHRAE Standard 135-2020: BACnet (Annex H: MS/TP Data Link Layer)\n- ABB, BACnet Protocol ACH550 AC Drives Operating Instructions\n- Danfoss, VLT HVAC Drive BACnet Operating Instructions\n- Consulting-Specifying Engineer, BACnet Control Points and Devices in BAS',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'vfd-integration-bacnet-building-automation'),
  id
FROM wiki_tags WHERE slug IN ('bacnet', 'vfd', 'hvac', 'commissioning', 'mstp', 'integration')
ON CONFLICT DO NOTHING;

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'vfd-integration-bacnet-building-automation'),
  f.id
FROM wiki_facets f WHERE f.slug IN ('bacnet', 'mstp', 'commissioning', 'integration', 'vfd')
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

UPDATE wiki_facets SET article_count = 0
WHERE id NOT IN (SELECT DISTINCT facet_id FROM wiki_article_facets);
