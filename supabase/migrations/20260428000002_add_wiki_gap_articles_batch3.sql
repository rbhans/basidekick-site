-- Wiki gap articles batch 3: Alarm management and energy metering.

-----------------------------------------------------------------------
-- ARTICLE 5: BAS Alarm Management Best Practices
-- Category: Best Practices
-- Sources:
--   ASHRAE Guideline 13-2015 (Specifying Building Automation Systems)
--   ASHRAE Guideline 13-2024
--   ISA-18.2-2016: Management of Alarm Systems for the Process Industries
--   Tridium Niagara Alarm Configuration documentation
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices'),
  'BAS Alarm Management Best Practices',
  'bas-alarm-management-best-practices',
  'Best practices for designing, configuring, and maintaining BAS alarm systems to reduce alarm fatigue and improve operator response, referencing ASHRAE Guideline 13 and ISA-18.2.',
  E'# BAS Alarm Management Best Practices\n\nPoorly managed alarms are one of the most common operational problems in building automation. When operators receive hundreds of nuisance alarms per day, they learn to ignore them — including the ones that matter. This guide covers alarm system design principles drawn from ASHRAE Guideline 13 and ISA-18.2.\n\n## The Alarm Fatigue Problem\n\nAlarm fatigue occurs when operators are overwhelmed by excessive, irrelevant, or low-priority alarms and begin to ignore or suppress them. The result is that genuine critical alarms are missed or acknowledged without action.\n\nCommon symptoms:\n\n- Operators acknowledge alarms in bulk without reading them\n- Critical alarms are buried among hundreds of nuisance alarms\n- Alarm logs show thousands of unacknowledged events\n- Standing alarms (always active) that no one investigates\n- Disabled alarms that were never re-enabled after maintenance\n\nSource: ISA-18.2-2016, Section 4 (Alarm Philosophy)\n\n## Alarm Classification\n\nNot every abnormal condition needs an alarm. Use this hierarchy:\n\n| Level | Response | Example |\n|---|---|---|\n| Critical Alarm | Immediate action required | Freeze stat tripped, fire alarm |\n| High-Priority Alarm | Action required within minutes | Equipment failure, high discharge temp |\n| Low-Priority Alarm | Action required within hours | Filter differential pressure high |\n| Warning/Advisory | Informational, no immediate action | Trend deviation, maintenance due |\n| Event/Log | Recorded for audit, no notification | Schedule change, operator override |\n\nSource: ISA-18.2-2016, Section 6 (Alarm Classification and Prioritization)\n\n## Design Principles\n\n### 1. Every Alarm Must Require a Response\n\nIf an alarm does not require the operator to take a specific action, it should not be an alarm. Demote it to a logged event or advisory.\n\nSource: ISA-18.2-2016, Section 4.2\n\n### 2. Define Clear Alarm Setpoints\n\nAvoid arbitrary thresholds. Base alarm limits on:\n\n- Equipment manufacturer specifications\n- Design conditions and sequences of operation\n- Actual operating data (review trend history to set realistic limits)\n- Safety code requirements\n\n### 3. Use Deadbands to Prevent Chatter\n\nA deadband is the difference between the alarm setpoint and the return-to-normal point. Without deadbands, a sensor oscillating near the threshold generates repeated alarm/clear cycles.\n\nExample:\n\n- High temperature alarm: 85 deg F\n- Deadband: 3 deg F\n- Alarm clears at: 82 deg F\n- Result: alarm activates once and clears once, not dozens of times\n\n### 4. Use Time Delays\n\nRequire the condition to persist for a defined period before annunciating:\n\n| Application | Typical Delay |\n|---|---|\n| Equipment failure proof | 30–60 seconds |\n| Temperature high/low | 5–15 minutes |\n| Communication loss | 2–5 minutes |\n| Filter dirty | 15–30 minutes |\n\nTime delays eliminate alarms caused by transient spikes and normal process fluctuations.\n\n### 5. Suppress Alarms Contextually\n\nAlarms that are irrelevant in certain operating modes should be suppressed:\n\n- Suppress discharge air temperature alarms when AHU is off\n- Suppress space temperature alarms during unoccupied periods\n- Suppress flow alarms during equipment startup sequences\n- Re-enable automatically when context changes\n\nSource: ASHRAE Guideline 13-2015, Section 10 (Alarms)\n\n## Alarm Routing\n\nRoute alarms based on priority and responsibility:\n\n| Priority | Routing |\n|---|---|\n| Critical | Operator console + SMS/email + audible annunciation |\n| High | Operator console + email |\n| Low | Operator console |\n| Advisory | Log only (viewable on demand) |\n\n## Alarm Documentation\n\nDocument every configured alarm:\n\n| Field | Example |\n|---|---|\n| Point name | AHU-1.SAT |\n| Alarm type | High limit |\n| Setpoint | 85 deg F |\n| Deadband | 3 deg F |\n| Time delay | 5 minutes |\n| Priority | High |\n| Response action | Check cooling valve, check refrigerant charge |\n| Suppression rule | Suppress when AHU is off |\n\n## Ongoing Alarm Management\n\n### Regular Review Cadence\n\n| Activity | Frequency |\n|---|---|\n| Review top 10 most frequent alarms | Monthly |\n| Audit disabled/shelved alarms | Monthly |\n| Review standing alarms (active > 24 hours) | Weekly |\n| Recalibrate alarm setpoints from trend data | Quarterly |\n| Full alarm rationalization | Annually |\n\n### Key Metrics to Track\n\n| Metric | Target |\n|---|---|\n| Alarms per operator per day | Under 150 (ISA-18.2 guideline) |\n| Percentage of standing alarms | Under 5% |\n| Nuisance/chattering alarms | Under 10% of total |\n| Alarms with documented response | 100% |\n\nSource: ISA-18.2-2016, Section 11 (Alarm System Monitoring and Assessment)\n\n## References\n\n- ISA-18.2-2016: Management of Alarm Systems for the Process Industries\n- ASHRAE Guideline 13-2015: Specifying Building Automation Systems (Section 10: Alarms)\n- ASHRAE Guideline 13-2024\n- EEMUA Publication 191: Alarm Systems — A Guide to Design, Management and Procurement',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'bas-alarm-management-best-practices'),
  id
FROM wiki_tags WHERE slug IN ('alarms', 'best-practices', 'hvac', 'commissioning')
ON CONFLICT DO NOTHING;

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'bas-alarm-management-best-practices'),
  f.id
FROM wiki_facets f WHERE f.slug IN ('alarms', 'commissioning', 'hvac')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 6: Energy Metering and Submetering in Building Automation
-- Category: How-To
-- Sources:
--   ASHRAE Standard 90.1-2022, Section 8.4.3
--   ASHRAE Standard 135-2020 (BACnet Accumulator and Pulse Converter)
--   BACnet International, "BACnet for Utilities and Metering" (2008)
--   IECC 2021, Section C405.12 (Energy Monitoring)
--   Eaton, "ASHRAE 90.1 & IECC 2021 Requirements for Energy Metering"
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'how-to'),
  'Energy Metering and Submetering in Building Automation',
  'energy-metering-submetering-building-automation',
  'How to integrate energy meters and submeters into a BAS, covering code requirements (ASHRAE 90.1, IECC 2021), BACnet metering objects, and practical integration guidance.',
  E'# Energy Metering and Submetering in Building Automation\n\nEnergy metering integration is a growing requirement in modern BAS installations. Building energy codes now mandate submetering by load type, and the BAS is the natural platform for collecting, storing, and reporting this data.\n\n## Code Requirements\n\n### ASHRAE Standard 90.1-2022, Section 8.4.3\n\nBuildings over 25,000 square feet must monitor electrical energy by load type:\n\n| Load Category | Monitoring Required |\n|---|---|\n| Whole building | Yes |\n| HVAC systems | Yes |\n| Interior lighting | Yes |\n| Exterior lighting | Yes |\n| Receptacle circuits | Yes |\n| Process loads | Yes (if significant) |\n\nData collection requirements:\n\n- Recording interval: 15 minutes maximum\n- Data retention: 36 months minimum\n- Must be capable of generating consumption reports\n\nSource: ANSI/ASHRAE/IES Standard 90.1-2022, Section 8.4.3\n\n### IECC 2021, Section C405.12\n\nThe International Energy Conservation Code requires similar energy monitoring for commercial buildings, with separate metering for the same load categories.\n\nSource: ICC, International Energy Conservation Code 2021, Section C405.12\n\n## Meter Communication Protocols\n\nEnergy meters connect to the BAS via several protocols:\n\n| Protocol | Common Use | Notes |\n|---|---|---|\n| Modbus RTU (RS-485) | Most common for revenue-grade meters | Register maps vary by manufacturer |\n| Modbus TCP | Larger meters with Ethernet | Standard port 502 |\n| BACnet MS/TP | BACnet-native meters | Direct integration, no gateway needed |\n| BACnet/IP | High-end meters | Ethernet-connected |\n| Pulse output | Simple kWh meters | One pulse per unit of energy consumed |\n\n## BACnet Metering Objects\n\nASHRAE 135 defines specific object types for metering:\n\n### Accumulator Object\n\nDesigned for pulse-counting meter inputs with guaranteed accuracy:\n\n- Tracks a running count of pulses from a meter\n- Includes a Scale property to convert pulses to engineering units\n- Provides Pulse_Rate for instantaneous demand\n- Designed for billing-grade accuracy — no pulses are lost\n\nSource: ANSI/ASHRAE Addendum d to Standard 135-2001; ASHRAE 135-2020\n\n### Pulse Converter Object\n\nSimilar to Accumulator but without the billing-grade accuracy guarantee:\n\n- Converts pulse counts to engineering unit values\n- Suitable for monitoring and trending but not revenue metering\n- Some pulses may be lost under high-speed counting conditions\n\nSource: ASHRAE 135-2020, Clause 12\n\n## Typical Meter Points\n\n| Point | BACnet Type | Unit | Notes |\n|---|---|---|---|\n| Total energy (kWh) | AI or Accumulator | kWh | Cumulative consumption |\n| Demand (kW) | AI | kW | Instantaneous or interval demand |\n| Voltage (L-L or L-N) | AI | Volts | Per phase if 3-phase |\n| Current | AI | Amps | Per phase if 3-phase |\n| Power factor | AI | Unitless (0–1) | Overall or per phase |\n| Frequency | AI | Hz | Line frequency |\n| Reactive power | AI | kVAR | If power quality monitoring needed |\n| Apparent power | AI | kVA | If needed for demand charges |\n\n## Pulse Metering Integration\n\nFor simple pulse-output meters (e.g., 1 pulse = 1 kWh):\n\n1. Wire the meter pulse output to a digital input on the BAS controller\n2. Configure the DI as a pulse counter (accumulator mode)\n3. Set the pulse weight (e.g., 1 pulse = 1 kWh, or 1 pulse = 0.1 kWh)\n4. Configure the BAS to calculate:\n   - Total consumption (pulse count multiplied by pulse weight)\n   - Interval demand (pulses per interval multiplied by pulse weight, divided by interval hours)\n5. Trend the accumulated value at 15-minute intervals per ASHRAE 90.1\n\n## Modbus Meter Integration\n\nFor Modbus-connected meters:\n\n1. Obtain the manufacturer register map document\n2. Identify register addresses for kWh, kW, voltage, current, power factor\n3. Confirm data types (integer, float, 16-bit, 32-bit) and byte order\n4. Configure the BAS Modbus driver with correct register mappings\n5. Set polling interval (typically 15–60 seconds for metering)\n6. Verify readings against the meter local display\n\n## Data Management\n\n### Trending Configuration\n\n| Data Point | Trend Interval | Retention |\n|---|---|---|\n| Energy (kWh) | 15 minutes | 36 months (per ASHRAE 90.1) |\n| Demand (kW) | 15 minutes | 36 months |\n| Voltage, current | 15 minutes | 12 months |\n| Power factor | 15 minutes | 12 months |\n\n### Demand Calculation\n\nInterval demand is calculated from accumulated energy:\n\n```\nDemand (kW) = (kWh at end of interval - kWh at start) / interval hours\n\nExample (15-minute interval):\n  kWh at 10:00 = 5000.0\n  kWh at 10:15 = 5012.5\n  Demand = (5012.5 - 5000.0) / 0.25 = 50 kW\n```\n\n### Meter Rollover Handling\n\nAccumulator-type registers eventually roll over to zero. The BAS must detect and handle this:\n\n- Track the previous reading and detect when the new reading is lower\n- Add the rollover maximum to the delta calculation\n- Most BACnet Accumulator objects handle this automatically via the Max_Pres_Value property\n\n## Commissioning Verification\n\n1. Compare BAS meter readings against the meter local display\n2. Compare against the utility revenue meter for whole-building readings\n3. Verify that the sum of submeters approximates the main meter total\n4. Confirm 15-minute trend data is being collected and stored\n5. Verify data export or reporting capability meets code requirements\n6. Test alarm setpoints for abnormal consumption or demand spikes\n\n## References\n\n- ANSI/ASHRAE/IES Standard 90.1-2022, Section 8.4.3\n- ICC, International Energy Conservation Code 2021, Section C405.12\n- ASHRAE Standard 135-2020 (Accumulator and Pulse Converter objects)\n- ANSI/ASHRAE Addendum d to Standard 135-2001\n- BACnet International, BACnet for Utilities and Metering (2008)\n- Eaton, ASHRAE 90.1 and IECC 2021 Requirements for Energy Metering',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'energy-metering-submetering-building-automation'),
  id
FROM wiki_tags WHERE slug IN ('energy-metering', 'modbus', 'bacnet', 'hvac', 'commissioning', 'sensors')
ON CONFLICT DO NOTHING;

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'energy-metering-submetering-building-automation'),
  f.id
FROM wiki_facets f WHERE f.slug IN ('modbus', 'bacnet', 'energy-metering', 'commissioning', 'sensors', 'hvac')
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
