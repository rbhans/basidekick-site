-- Add field troubleshooting wiki articles: MS/TP diagnostics, BBMD/FDR,
-- analog input scaling, Niagara TLS/certificates, Metasys SCT archive
-- hygiene, and BAS network ports for IT.

-- Ensure new tags exist before article-tag linking.
INSERT INTO wiki_tags (name, slug)
VALUES
  ('bbmd', 'bbmd'),
  ('sensors', 'sensors'),
  ('tls', 'tls'),
  ('foxs', 'foxs'),
  ('sct', 'sct'),
  ('backup', 'backup')
ON CONFLICT (slug) DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 1: Diagnosing BACnet MS/TP Networks with a Multimeter
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'issues-solutions-general'),
  'Diagnosing BACnet MS/TP Networks with a Multimeter (Field Checklist)',
  'diagnosing-bacnet-mstp-with-multimeter',
  'A repeatable MS/TP troubleshooting flow using multimeter checks, termination verification, topology fixes, and fast isolation by bifurcation.',
  E'# Diagnosing BACnet MS/TP Networks with a Multimeter (Field Checklist)\n\nWhen BACnet MS/TP devices start dropping offline, answering slowly, or appearing to work intermittently, the root cause is usually wiring, termination, noise, or topology violations—not software. This checklist focuses on fast isolation using a basic multimeter and simple segmentation techniques.\n\n## Problem\n\nMS/TP devices intermittently disappear, token passing is unstable, or routers show frequent timeouts and retries.\n\n## Root Cause\n\nMost recurring MS/TP instability comes from:\n\n- Incorrect topology (star or T-taps instead of daisy chain)\n- Wrong or excessive end-of-line (EOL) termination\n- Polarity inconsistencies (+ and - swapped)\n- Shield and ground issues causing noise coupling or ground loops\n- Excessive trunk length or device count beyond segment limits\n\n## Solution\n\n### Step A: Make the network safe to measure\n\n1. If possible, schedule a short window to stop traffic and power down the MS/TP segment, or at minimum isolate it from the router.\n2. Document where the router or RS-485 adapter connects and where the two physical ends of the trunk are.\n\n### Step B: Topology sanity check (visual inspection)\n\n- MS/TP should be wired in a **single trunk / daisy chain**. Avoid star wiring and T-taps.\n- Confirm consistent polarity end-to-end; mixed polarity will cause communication failure.\n\n### Step C: Resistance test (power off)\n\nWith the segment powered down:\n\n1. Measure resistance across the data pair at one end of the trunk.\n2. Interpret results:\n   - Two 120Ω terminators in place: measured resistance is typically **~60Ω** (120Ω ‖ 120Ω ≈ 60Ω).\n   - Much lower value: possible extra terminators or a short circuit.\n   - Very high value or open circuit: likely missing termination or a broken trunk.\n\n### Step D: Termination check (ends only)\n\n- Termination should be applied only at the two physical ends of the trunk, not at intermediate devices.\n- If the trunk is near maximum length, termination correctness becomes non-negotiable.\n\n### Step E: Voltage/bias check (power on)\n\nWith the segment powered and idle, measure DC voltage between the data lines and common. The goal is to confirm a stable differential bias rather than a floating bus. Persistent "lost token" behavior is frequently correlated with bias and termination problems.\n\n### Step F: Segment by bifurcation (fast isolation)\n\nIf the trunk covers many devices:\n\n1. Split the trunk roughly in half and see which half becomes stable.\n2. Keep halving the problematic section until you isolate the fault.\n\nThis divide-and-conquer approach is the fastest way to narrow down the fault location without guesswork.\n\n### Step G: Common field fixes\n\n- Remove T-taps and star branches; re-wire into an in/out daisy chain.\n- Correct polarity consistently across the entire trunk.\n- Ensure only the two far ends are terminated; remove extra EOL resistors in the middle.\n- If the trunk exceeds typical length limits, add a repeater and create a new segment.\n\n## Field Notes / Gotchas\n\n- Some vendor devices include built-in termination or bias that must be enabled or disabled explicitly. Confirm your hardware behavior before adding external terminators.\n- Noise sources such as VFDs and power conductors close to the trunk can induce communication faults. Maintain separation and preserve cable twist integrity.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'diagnosing-bacnet-mstp-with-multimeter'),
  id
FROM wiki_tags
WHERE slug IN ('bacnet', 'mstp', 'networking', 'troubleshooting', 'protocols')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 2: BACnet/IP Across VLANs: BBMD and FDR Cookbook
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices-general'),
  'BACnet/IP Across VLANs: BBMD and Foreign Device Registration (FDR) Cookbook',
  'bacnet-ip-vlans-bbmd-foreign-device-registration',
  'A practical BBMD/FDR recipe for BACnet/IP discovery and broadcast forwarding across routed networks and VLANs.',
  E'# BACnet/IP Across VLANs: BBMD and Foreign Device Registration (FDR) Cookbook\n\nBACnet/IP discovery relies heavily on broadcast behavior. Once you introduce routers and VLANs, Who-Is/I-Am traffic will not automatically cross subnet boundaries. BBMD (BACnet Broadcast Management Device) and Foreign Device Registration (FDR) exist to solve that—but only if implemented deliberately.\n\n## Problem\n\nYou can see BACnet/IP devices on the same subnet, but discovery fails across VLANs and subnets. Workstations cannot find anything unless temporarily placed on the controller VLAN.\n\n## Root Cause\n\nIP routers do not forward broadcast packets between subnets. BACnet/IP discovery breaks unless you implement a BACnet broadcast management strategy.\n\n## Solution\n\n### Step A: Decide your pattern\n\nCommon patterns:\n\n- **BBMD per BACnet/IP subnet**, with all BBMDs sharing a Broadcast Distribution Table (BDT).\n- **Foreign Device Registration (FDR)** for devices or workstations that are not on a BACnet subnet (e.g., a remote workstation or service laptop).\n\n### Step B: Choose the BBMD host(s)\n\nBBMD capability is typically provided by a BACnet/IP router, supervisory controller, or dedicated gateway device. Select a stable, always-on device per subnet.\n\n### Step C: Build the Broadcast Distribution Table\n\n1. Enumerate each BACnet/IP subnet that must participate.\n2. Add each BBMD IP address to the BDT on every other BBMD (full-mesh BDT).\n3. Validate that your BDT configuration is controlled and documented—the BDT governs how broadcast forwarding operates across subnets.\n\n### Step D: Configure Foreign Device Registration where needed\n\nUse FDR for:\n\n- Portable service tools (temporary access)\n- Remote operator workstations not placed on a BACnet subnet\n- Remote integrations that must receive broadcast-type announcements but cannot be on the same L2 network\n\nImplementation checklist:\n\n- Confirm the BBMD supports FDR and has an accessible Foreign Device Table (FDT).\n- Set an appropriate registration TTL (time-to-live) and monitor renewal behavior.\n\n### Step E: NAT and remote access caution\n\nIf you are relying on NAT for remote access, test carefully. Broadcast forwarding and address translation can create non-obvious failure modes. Treat remote BACnet/IP discovery through NAT as a design requirement that needs explicit validation—not an assumption.\n\n### Step F: Security baseline\n\n- Keep BACnet/IP traffic scoped to only required networks.\n- Avoid exposing BACnet services directly to the public internet.\n- Prefer a segmented design and document which hosts are allowed to originate BACnet traffic.\n\n## Verification\n\n- From a workstation on VLAN A, you can discover devices on VLAN B reliably.\n- BBMD tables are consistent across all participating subnets.\n- FDR devices appear in the FDT and continue to receive discovery responses until TTL expiry and renewal.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'bacnet-ip-vlans-bbmd-foreign-device-registration'),
  id
FROM wiki_tags
WHERE slug IN ('bacnet', 'networking', 'protocols', 'best-practices', 'bbmd')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 3: Analog Input Scaling in BAS
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'how-to-general'),
  'Analog Input Scaling in BAS: 4–20 mA and 0–10 V Done Right',
  'analog-input-scaling-4-20ma-0-10v-bas',
  'Commissioning and troubleshooting checklist for analog scaling with practical formulas, meter-first validation, and thermistor curve gotchas.',
  E'# Analog Input Scaling in BAS: 4–20 mA and 0–10 V Done Right\n\nIf a pressure sensor reads 2× high or a temperature jumps around, the problem is frequently scaling, range selection, sensor type mismatch, or a wiring issue—not the controller. Use this checklist to validate signal type, confirm raw values with a meter, and apply correct linear scaling.\n\n## Problem\n\nAnalog inputs read incorrectly (offset, inverted, or clipped at min/max), or different devices read the same sensor differently.\n\n## Root Cause\n\nTypical causes:\n\n- Configured as 0–20 mA while the sensor outputs 4–20 mA, or vice versa\n- Wrong input mode (voltage vs current)\n- Wrong min/max engineering range\n- Wiring error (loop power, wrong terminals)\n- Thermistor curve mismatch (e.g., 10k Type II vs 10k Type III)\n\n## Solution\n\n### Step A: Confirm the signal electrically before touching software\n\n1. Identify the sensor output type from documentation or label: 4–20 mA, 0–10 V, thermistor, or RTD.\n2. Measure the signal with a meter at the controller input or test points:\n   - For 4–20 mA: confirm the live current is plausible for operating conditions.\n   - For 0–10 V: confirm the voltage moves with the process variable.\n\n### Step B: Validate controller input mode\n\nEnsure the analog input channel is configured for the correct electrical mode (mA vs V), and confirm any shunt resistors or jumpers the hardware requires.\n\n### Step C: Apply correct linear scaling (4–20 mA)\n\nThe standard convention is 4 mA = 0% span and 20 mA = 100% span.\n\nEngineering units formula:\n\n```\nPercent = (mA − 4) / 16\nEngineeringValue = Percent × (EUmax − EUmin) + EUmin\n```\n\nUse your BAS scaling block or the BASidekick Sensor & Signal Scaling calculator to implement this consistently.\n\n### Step D: Apply correct linear scaling (0–10 V)\n\nUse the same linear approach:\n\n```\nPercent = (V − Vmin) / (Vmax − Vmin)\nEngineeringValue = Percent × (EUmax − EUmin) + EUmin\n```\n\n### Step E: Detect range mismatch patterns fast\n\n- If the value reads approximately 20% low at the bottom of range, suspect 4–20 mA vs 0–20 mA mismatch.\n- If it pegs at max or min despite process changes, suspect wrong input mode or wiring.\n- If it drifts or is extremely noisy, suspect grounding or shielding problems.\n\n### Step F: Thermistor sanity check\n\nIf using thermistors:\n\n- Confirm the BAS is configured for the correct thermistor curve (e.g., specific 10k curve family).\n- Validate by measuring resistance and comparing to the correct curve table for that thermistor type.\n\n## Example: 4–20 mA Pressure Sensor (0–300 psi)\n\n| Measured mA | Calculation | Result |\n|---|---|---|\n| 4 mA | (4−4)/16 × 300 | 0 psi |\n| 12 mA | (12−4)/16 × 300 | 150 psi |\n| 20 mA | (20−4)/16 × 300 | 300 psi |\n\n## Field Notes / Gotchas\n\n- A common mismatch: a transmitter configured for 4–20 mA is wired to a controller input set for 0–10 V. The controller sees a very small voltage and reports near-zero values even at full process range.\n- For loop-powered sensors, confirm the controller supplies the correct loop voltage (typically 24 VDC) before assuming a sensor is faulty.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'analog-input-scaling-4-20ma-0-10v-bas'),
  id
FROM wiki_tags
WHERE slug IN ('best-practices', 'troubleshooting', 'sensors', 'commissioning')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 4: Niagara TLS & Certificates Troubleshooting Guide
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'issues-solutions-niagara'),
  'Niagara TLS and Certificates Troubleshooting Guide (Workbench, Web, and Station-to-Station)',
  'niagara-tls-certificates-troubleshooting-guide',
  'Decision-tree troubleshooting for Niagara TLS failures, covering trust stores, certificate lifecycle, and fox/foxs/foxwss port mismatches.',
  E'# Niagara TLS and Certificates Troubleshooting Guide (Workbench, Web, and Station-to-Station)\n\nTLS failures in Niagara typically fall into three categories: (1) trust problems (untrusted CA or missing chain), (2) certificate lifecycle problems (expired, not-yet-valid, or hostname mismatch), or (3) protocol and port mismatch (fox vs foxs vs foxwss, HTTP vs HTTPS). Use this checklist to diagnose quickly.\n\n## Problem\n\nYou cannot connect to a station or platform securely; Workbench shows TLS errors; the browser shows certificate warnings; or station-to-station links fail after security changes.\n\n## Root Cause\n\n- The station or platform is presenting a certificate that clients do not trust, or clients have not approved it.\n- The certificate is not valid for the hostname being used (SAN/CN mismatch) or is expired.\n- You are using the wrong protocol/port combination (fox vs foxs vs foxwss; HTTP vs HTTPS).\n\n## Solution\n\n### Step A: Identify how you are connecting\n\n| Connection type | Protocol | Notes |\n|---|---|---|\n| Browser (Web UI) | HTTP / HTTPS | Standard web ports |\n| Workbench to Station | fox / foxs | fox = unencrypted, foxs = TLS |\n| Station-to-Station driver | foxs | Typically encrypted |\n| WebSocket-based | foxwss | If enabled; uses standard web ports |\n\n### Step B: Confirm the expected ports\n\n| Protocol | Default port | Notes |\n|---|---|---|\n| fox (unencrypted) | 1911 | Not recommended for production |\n| foxs (TLS) | 4911 | Niagara secure baseline |\n| foxwss (Fox over WebSocket) | 443 | Leverages standard HTTPS port |\n\n### Step C: Certificate validity checks\n\n- Verify system time on the host and client—time skew causes "not yet valid" failures.\n- Confirm the hostname used in the URL is covered by the certificate identity fields (SAN or CN).\n- Confirm the certificate expiry date and plan renewal cycles proactively.\n\n### Step D: Workbench trust and approval workflow\n\nIf you see certificate-related UI errors (including help or webstation access issues), check Workbench certificate management. Unapproved hosts and certificates must be approved or regenerated before smooth operation. This is the same failure mode seen in "Cannot Load Help" issues.\n\n### Step E: Post-hardening connectivity breaks\n\nAfter hardening changes (HTTPS-only enforcement, stronger authentication policies), station-to-station connections may fail unless all supervisors and JACEs are updated to the new credentials and to HTTPS/foxs endpoints.\n\n### Step F: When to rebuild vs when to re-trust\n\n| Symptom | Action |\n|---|---|\n| Valid certificate, but not trusted | Fix trust chain or approve in Workbench |\n| Expired or wrong hostname | Re-issue and redeploy across Fox/Web/Platform endpoints |\n| Port mismatch | Update connection string to correct protocol and port |\n\n## Field Notes / Gotchas\n\n- foxwss is designed to use port 443, which often passes through firewalls without special rules—useful for cloud-connected scenarios.\n- If you regenerate a station certificate, any Workbench installations that previously approved the old certificate will flag the new one. Re-approve on each client.\n- Always check system clocks first—incorrect time is a common and fast-to-diagnose cause of TLS failures.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'niagara-tls-certificates-troubleshooting-guide'),
  id
FROM wiki_tags
WHERE slug IN ('niagara', 'troubleshooting', 'security', 'certificate', 'tls', 'foxs')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 5: Metasys SCT Archive Hygiene and Recovery Workflow
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices-metasys'),
  'Metasys SCT Archive Hygiene and Recovery Workflow',
  'metasys-sct-archive-hygiene-recovery-workflow',
  'Best-practice workflow for maintaining SCT archives using site discovery, backups, validation cadences, and a recovery playbook.',
  E'# Metasys SCT Archive Hygiene and Recovery Workflow\n\nSCT archives are your safety net for restores, upgrades, and forensic troubleshooting. The archive is only useful if it stays current, is backed up, and can be validated. This workflow shows how to keep SCT archives healthy and recover reliably.\n\n## Problem\n\nWhen you need to restore or modify a Metasys site, the SCT archive is missing devices, outdated, or cannot properly upload or download—turning a routine change into an emergency.\n\n## Root Cause\n\n- The archive is not maintained through a consistent workflow (uploads after changes, periodic validation).\n- Devices and sites were not added using supported methods (site discovery and archive population workflows).\n\n## Solution\n\n### Step A: Establish source-of-truth rules\n\n- Define who owns archive updates (project engineer, lead technician, etc.).\n- Require an archive update after significant changes: new engines, major programming or graphics changes, mass point edits.\n\n### Step B: Populate archives correctly\n\nWhen building or updating an archive, use SCT site discovery workflows:\n\n1. Use **Site Discovery** to retrieve site information from a Site Director.\n2. Insert devices using the Insert menu and site discovery workflow.\n3. Confirm all engines and supervisory devices are represented correctly.\n\n### Step C: Maintain sites and supervisory devices\n\n- Document the site hierarchy in a standard way.\n- Verify IP addressing is captured correctly—IP changes can affect communication behavior and must be updated in the archive.\n- Do not rely on tribal knowledge to reconstruct a site; the archive is the authoritative record.\n\n### Step D: Backup strategy\n\n- Export and store archives in a controlled repository with date-stamped filenames.\n- Keep at least one offline copy: site restore scenarios often coincide with network outages that prevent access to network shares.\n- Confirm backup files can actually be opened before you need them in an emergency.\n\n### Step E: Validate the archive on a schedule\n\nAt a target cadence (monthly or quarterly):\n\n- Open the archive and confirm devices exist and key objects are present.\n- Spot-check connectivity paths, especially if IP addressing has changed since the last update.\n- Confirm the archive version is compatible with the current SCT version in use.\n\n### Step F: Recovery playbook\n\nIf a site fails and you must restore:\n\n1. Identify the most recent known-good archive backup.\n2. Validate you can open it and that it includes the affected engines and devices.\n3. Execute the restore and upload based on your site operational constraints.\n4. Immediately re-establish the archive hygiene cycle after recovery so the next event is easier.\n\n## Field Notes / Gotchas\n\n- An archive last updated before a major retrofit may be missing entire subsystems. Always verify coverage before assuming a backup is usable.\n- If you are replacing an engine, upload to the archive before decommissioning the old hardware.\n- Keeping an offline copy (USB drive or offline server) is critical because SCT restore events often happen alongside the same network failures that prevent access to network shares.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'metasys-sct-archive-hygiene-recovery-workflow'),
  id
FROM wiki_tags
WHERE slug IN ('metasys', 'sct', 'best-practices', 'troubleshooting', 'backup')
ON CONFLICT DO NOTHING;

-----------------------------------------------------------------------
-- ARTICLE 6: BAS Network Ports for IT: Minimal Connectivity Rules
-----------------------------------------------------------------------
INSERT INTO wiki_articles (category_id, title, slug, summary, content, is_published)
VALUES (
  (SELECT id FROM wiki_categories WHERE slug = 'best-practices-general'),
  'BAS Network Ports for IT: Minimal Connectivity Rules (BACnet, Niagara, Metasys, MQTT)',
  'bas-network-ports-minimal-connectivity-rules',
  'Minimal port and flow documentation for BAS networks, aligned with vendor guidance and a least-privilege posture.',
  E'# BAS Network Ports for IT: Minimal Connectivity Rules (BACnet, Niagara, Metasys, MQTT)\n\n"IT blocked it" is not a troubleshooting strategy. This page provides a minimal, vendor-aligned port checklist and a framework for describing BAS connectivity needs in IT language: source, destination, protocol, and purpose.\n\n## Problem\n\nBAS devices, supervisors, workstations, and integrations cannot communicate because firewall rules are missing or overly broad. Projects stall while teams argue about which ports are needed.\n\n## Root Cause\n\n- BAS requirements are not documented as specific flows (source → destination → protocol/port → purpose).\n- Default ports are used without confirming which services are enabled or how security hardening changes defaults.\n\n## Solution\n\n### Step A: Start with a simple connectivity matrix\n\nFor each integration, document:\n\n| Field | Example |\n|---|---|\n| Source host(s) | Workstation 10.1.2.50 |\n| Destination host(s) | JACE-8000 10.10.5.20 |\n| Protocol | TCP |\n| Port(s) | 4911 |\n| Service purpose | Niagara station connection (foxs) |\n| TLS/encrypted | Yes |\n\n### Step B: Common BAS ports (starting point)\n\n**BACnet/IP**\n\n| Service | Port | Notes |\n|---|---|---|\n| BACnet/IP discovery | UDP 47808 | IANA-registered BACnet port |\n\n**Niagara Fox connections**\n\n| Protocol | Default port | Notes |\n|---|---|---|\n| fox (unencrypted) | TCP 1911 | Not recommended for production |\n| foxs (TLS) | TCP 4911 | Niagara secure baseline |\n| foxwss (Fox over WebSocket) | TCP 443 | Passes standard HTTPS firewall rules |\n\n**Metasys**\n\nMetasys and SCT documentation includes defined port sets and firewall configuration guidance. Implement only what your specific Metasys roles and features require. Reference Johnson Controls Network and IT Guidance for the authoritative port list for your deployment version.\n\n**MQTT (if used)**\n\n| Protocol | Common port | Notes |\n|---|---|---|\n| MQTT (unencrypted) | TCP 1883 | Avoid in production deployments |\n| MQTT over TLS | TCP 8883 | Preferred for production use |\n\n### Step C: Design guardrails\n\n- Segment BAS networks and restrict which hosts can initiate controller connections.\n- Prefer TLS-enabled services (foxs, HTTPS, MQTT over TLS) where supported.\n- If you need BACnet/IP discovery across subnets, use a deliberate BBMD/FDR strategy rather than broad network exposure.\n- Never expose BACnet or controller management interfaces directly to the public internet.\n\n## Field Notes / Gotchas\n\n- foxwss on port 443 often passes through corporate firewalls without special rules, making it useful for cloud-connected or remotely-managed sites.\n- BACnet on UDP 47808 is bidirectional—ensure both ingress and egress rules exist in your firewall matrix.\n- Always get port requirements in writing from the BAS contractor and cross-reference with vendor hardening guides before finalizing firewall rules.',
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT
  (SELECT id FROM wiki_articles WHERE slug = 'bas-network-ports-minimal-connectivity-rules'),
  id
FROM wiki_tags
WHERE slug IN ('networking', 'security', 'best-practices', 'bacnet', 'niagara', 'metasys', 'mqtt')
ON CONFLICT DO NOTHING;
