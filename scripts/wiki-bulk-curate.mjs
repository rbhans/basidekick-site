#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_REF = "cwdoklplunlaqakiyagb";
const DEFAULT_SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const WORK_DIR = ".wiki-work";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const FIX_WEAK = args.has("--fix-weak");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const ARTICLE_LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 100;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Run with the live bas-sidekick service role key.");
  process.exit(1);
}

const COMMON_REFS = {
  cisaBas: {
    label: "CISA - Securing Building Automation Systems",
    url: "https://www.cisa.gov/news-events/alerts/2012/10/17/securing-building-automation-systems",
  },
  nist80082: {
    label: "NIST SP 800-82 Rev. 3 - Guide to Operational Technology Security",
    url: "https://csrc.nist.gov/pubs/sp/800/82/r3/final",
  },
  bacnet: {
    label: "BACnet International - BACnet Overview",
    url: "https://bacnet.org/bacnet-overview/",
  },
  ashraeBacnet: {
    label: "ASHRAE - BACnet Standard 135",
    url: "https://www.ashrae.org/technical-resources/bookstore/bacnet",
  },
  modbus: {
    label: "Modbus Organization - Technical Resources",
    url: "https://modbus.org/specs.php",
  },
  mqtt: {
    label: "MQTT.org - MQTT Standard",
    url: "https://mqtt.org/",
  },
  sparkplug: {
    label: "Eclipse Sparkplug - Specification",
    url: "https://sparkplug.eclipse.org/specification/",
  },
  haystack: {
    label: "Project Haystack - Documentation",
    url: "https://project-haystack.org/doc/docHaystack/Intro",
  },
  brick: {
    label: "Brick Schema - Documentation",
    url: "https://docs.brickschema.org/",
  },
  opcUa: {
    label: "OPC Foundation - OPC UA",
    url: "https://opcfoundation.org/about/opc-technologies/opc-ua/",
  },
  opcReference: {
    label: "OPC Foundation - Online Reference",
    url: "https://reference.opcfoundation.org/",
  },
  obix: {
    label: "OASIS - oBIX 1.1 Specification",
    url: "https://docs.oasis-open.org/obix/obix/v1.1/obix-v1.1.html",
  },
  knx: {
    label: "KNX Association - What is KNX",
    url: "https://www.knx.org/knx-en/for-professionals/What-is-KNX/",
  },
  lonmark: {
    label: "LonMark International - LonMark Systems",
    url: "https://www.lonmark.org/",
  },
  dali: {
    label: "DALI Alliance - DALI Lighting Control",
    url: "https://www.dali-alliance.org/dali/",
  },
  tridium: {
    label: "Tridium - Niagara Documentation Library",
    url: "https://www.tridium.com/us/en/services-support/library",
  },
  jciDocs: {
    label: "Johnson Controls - Building Automation Documentation",
    url: "https://docs.johnsoncontrols.com/bas/",
  },
  ashrae36: {
    label: "ASHRAE - Guideline 36",
    url: "https://www.ashrae.org/technical-resources/bookstore/guideline-36-high-performance-sequences-of-operation-for-hvac-systems",
  },
};

const PLATFORMS = [
  {
    name: "Siemens Desigo CC",
    vendor: "Siemens",
    slug: "siemens-desigo-cc",
    docLabel: "Siemens Building X and Desigo Documentation",
    docUrl: "https://docs.buildingtechnologies.siemens.com/",
    productUrl: "https://www.siemens.com/global/en/products/buildings/automation/desigo.html",
    protocols: "BACnet, OPC UA, Modbus, KNX, and vendor integration paths as licensed and documented",
  },
  {
    name: "Schneider Electric EcoStruxure Building Operation",
    vendor: "Schneider Electric",
    slug: "schneider-ecostruxure-building-operation",
    docLabel: "EcoStruxure Building Operation WebHelp",
    docUrl: "https://ecostruxure-building-help.se.com/",
    productUrl: "https://www.se.com/us/en/work/products/product-launch/ecostruxure-building-operation/",
    protocols: "BACnet, Modbus, LonWorks, web services, and EcoStruxure integration components",
  },
  {
    name: "Honeywell WEBs N4",
    vendor: "Honeywell",
    slug: "honeywell-webs-n4",
    docLabel: "Honeywell Buildings - WEBs Building Automation",
    docUrl: "https://buildings.honeywell.com/us/en/products/by-category/building-management/building-control-system/webs-nts",
    productUrl: "https://buildings.honeywell.com/",
    protocols: "Niagara-based drivers, BACnet, Modbus, LonWorks, and licensed integration modules",
  },
  {
    name: "Honeywell Spyder Controllers",
    vendor: "Honeywell",
    slug: "honeywell-spyder",
    docLabel: "Honeywell Buildings - Controllers",
    docUrl: "https://buildings.honeywell.com/us/en/products/by-category/building-management/controllers",
    productUrl: "https://buildings.honeywell.com/",
    protocols: "BACnet MS/TP, LonWorks, and controller-family specific tooling",
  },
  {
    name: "Alerton Compass",
    vendor: "Alerton",
    slug: "alerton-compass",
    docLabel: "Alerton Compass Product Information",
    docUrl: "https://alerton.com/Products/Software/Compass",
    productUrl: "https://alerton.com/",
    protocols: "BACnet and Alerton controller workflows documented by Alerton",
  },
  {
    name: "Automated Logic WebCTRL",
    vendor: "Automated Logic",
    slug: "automated-logic-webctrl",
    docLabel: "Automated Logic - WebCTRL Building Automation System",
    docUrl: "https://www.automatedlogic.com/en/products-services/webctrl-building-automation-system/",
    productUrl: "https://www.automatedlogic.com/",
    protocols: "BACnet, operator graphics, schedules, alarms, and WebCTRL integration workflows",
  },
  {
    name: "Carrier i-Vu",
    vendor: "Carrier",
    slug: "carrier-ivu",
    docLabel: "Carrier - i-Vu Building Automation System",
    docUrl: "https://www.carrier.com/commercial/en/us/products/controls/i-vu-building-automation-system/",
    productUrl: "https://www.carrier.com/commercial/en/us/products/controls/",
    protocols: "Carrier controls, BACnet, equipment integration, alarms, schedules, and graphics",
  },
  {
    name: "Trane Tracer SC+",
    vendor: "Trane",
    slug: "trane-tracer-sc-plus",
    docLabel: "Trane - Tracer SC+",
    docUrl: "https://www.trane.com/commercial/north-america/us/en/products-systems/building-management-systems/tracer-sc-plus.html",
    productUrl: "https://www.trane.com/commercial/north-america/us/en/products-systems/building-management-systems.html",
    protocols: "Trane controls, BACnet, scheduling, alarms, equipment coordination, and enterprise integration",
  },
  {
    name: "Delta Controls enteliWEB",
    vendor: "Delta Controls",
    slug: "delta-controls-enteliweb",
    docLabel: "Delta Controls - enteliWEB",
    docUrl: "https://deltacontrols.com/products-services/building-management-systems/enteliweb/",
    productUrl: "https://deltacontrols.com/",
    protocols: "BACnet-centric Delta Controls deployments and enteliWEB operator workflows",
  },
  {
    name: "Distech Controls EC-Net and ECLYPSE",
    vendor: "Distech Controls",
    slug: "distech-controls-ec-net-eclypse",
    docLabel: "Distech Controls - Products",
    docUrl: "https://www.distech-controls.com/products",
    productUrl: "https://www.distech-controls.com/",
    protocols: "BACnet/IP, BACnet MS/TP, IP controllers, EC-Net, and ECLYPSE workflows",
  },
  {
    name: "KMC Commander and Conquest",
    vendor: "KMC Controls",
    slug: "kmc-commander-conquest",
    docLabel: "KMC Controls - Building Automation",
    docUrl: "https://www.kmccontrols.com/building-automation/",
    productUrl: "https://www.kmccontrols.com/",
    protocols: "BACnet controllers, Commander, Conquest, and KMC integration workflows",
  },
  {
    name: "ABB Cylon",
    vendor: "ABB",
    slug: "abb-cylon",
    docLabel: "ABB - Cylon Building Automation",
    docUrl: "https://new.abb.com/buildings/smarter-building-solutions/cylon",
    productUrl: "https://new.abb.com/buildings",
    protocols: "ABB Cylon controllers, BACnet, supervisory applications, and documented integration methods",
  },
  {
    name: "Belimo Actuators and Sensors",
    vendor: "Belimo",
    slug: "belimo-actuators-sensors",
    docLabel: "Belimo - Products",
    docUrl: "https://www.belimo.com/us/en_US/products",
    productUrl: "https://www.belimo.com/",
    protocols: "Actuator, valve, sensor, BACnet, Modbus, MP-Bus, and product-specific wiring workflows",
  },
  {
    name: "Daikin intelligent Touch Manager",
    vendor: "Daikin",
    slug: "daikin-intelligent-touch-manager",
    docLabel: "Daikin - intelligent Touch Manager",
    docUrl: "https://www.daikinac.com/content/commercial/accessories-and-controllers/intelligent-touch-manager/",
    productUrl: "https://www.daikinac.com/",
    protocols: "Daikin equipment networks, centralized control, schedules, energy management, and integration options",
  },
  {
    name: "EasyIO Controllers",
    vendor: "EasyIO",
    slug: "easyio-controllers",
    docLabel: "EasyIO - Products",
    docUrl: "https://www.easyio.pro/products/",
    productUrl: "https://www.easyio.pro/",
    protocols: "IP controllers, BACnet, Modbus, MQTT, and EasyIO programming workflows as documented by EasyIO",
  },
  {
    name: "Lynxspring JENEsys",
    vendor: "Lynxspring",
    slug: "lynxspring-jenesys",
    docLabel: "Lynxspring - JENEsys",
    docUrl: "https://www.lynxspring.com/jenesys",
    productUrl: "https://www.lynxspring.com/",
    protocols: "Niagara-based JENEsys controllers, gateways, and integration modules",
  },
  {
    name: "Contemporary Controls BASrouter and BASgateway",
    vendor: "Contemporary Controls",
    slug: "contemporary-controls-basrouter",
    docLabel: "Contemporary Controls - BASrouter",
    docUrl: "https://www.ccontrols.com/basautomation/basrouter.php",
    productUrl: "https://www.ccontrols.com/basautomation/",
    protocols: "BACnet/IP, BACnet MS/TP routing, Modbus integration, and gateway commissioning",
  },
  {
    name: "LOYTEC Building Automation",
    vendor: "LOYTEC",
    slug: "loytec-building-automation",
    docLabel: "LOYTEC - Products",
    docUrl: "https://www.loytec.com/products",
    productUrl: "https://www.loytec.com/",
    protocols: "BACnet, LonMark, Modbus, M-Bus, KNX, OPC, and LOYTEC gateway/controller workflows",
  },
];

const PROTOCOL_TOPICS = [
  ["modbus-tcp-rtu-register-mapping", "Modbus TCP and RTU Register Mapping Checklist", "Modbus TCP/RTU integrations fail when teams skip register tables, byte order, scaling, and polling limits.", "modbus", [COMMON_REFS.modbus]],
  ["knx-topology-and-group-addressing", "KNX Topology and Group Addressing for BAS Integrators", "KNX projects need clear line topology, group-address documentation, and gateway boundaries before BAS integration.", "knx", [COMMON_REFS.knx]],
  ["lonworks-lonmark-integration-reference", "LonWorks and LonMark Integration Reference", "Legacy LonWorks systems are still common in BAS retrofits and need careful network, binding, and gateway documentation.", "lonworks", [COMMON_REFS.lonmark]],
  ["opc-ua-bas-integration-reference", "OPC UA BAS Integration Reference", "OPC UA can bridge BAS data to industrial and enterprise systems when namespace, security, and ownership are explicit.", "opc-ua", [COMMON_REFS.opcUa, COMMON_REFS.opcReference]],
  ["obix-building-automation-api-reference", "oBIX Building Automation API Reference", "oBIX provides a web-services model for building systems, but integrations still need object, history, and security boundaries.", "obix", [COMMON_REFS.obix]],
  ["mqtt-bas-topic-namespace-checklist", "MQTT Topic Namespace Checklist for BAS", "MQTT BAS integrations need consistent topic naming, TLS, ACLs, retained-message rules, and command separation.", "mqtt", [COMMON_REFS.mqtt, COMMON_REFS.nist80082]],
  ["sparkplug-b-birth-death-certificate-checklist", "Sparkplug B Birth and Death Certificate Checklist", "Sparkplug B improves MQTT interoperability when birth/death certificates, metric names, and state handling are validated.", "sparkplug-b", [COMMON_REFS.sparkplug, COMMON_REFS.mqtt]],
  ["project-haystack-site-modeling-checklist", "Project Haystack Site Modeling Checklist", "Haystack tags make BAS data usable when sites, equips, points, units, and relationships are modeled consistently.", "haystack", [COMMON_REFS.haystack]],
  ["brick-schema-relationship-modeling-checklist", "Brick Schema Relationship Modeling Checklist", "Brick modeling adds graph relationships for equipment, points, spaces, and systems that analytics can query reliably.", "brick", [COMMON_REFS.brick]],
  ["bacnet-sc-certificate-operations-checklist", "BACnet/SC Certificate Operations Checklist", "BACnet/SC depends on certificate lifecycle discipline, hub/node configuration, and clear trust ownership.", "bacnet-sc", [COMMON_REFS.bacnet, COMMON_REFS.ashraeBacnet]],
  ["bacnet-mstp-trunk-design-reference", "BACnet MS/TP Trunk Design Reference", "MS/TP reliability starts with trunk topology, termination, device addressing, baud rate discipline, and router boundaries.", "mstp", [COMMON_REFS.bacnet, COMMON_REFS.ashraeBacnet]],
  ["bacnet-ip-bbmd-fdr-reference", "BACnet/IP BBMD and FDR Reference", "BACnet/IP discovery across routed networks needs deliberate BBMD and foreign-device registration design.", "bacnet", [COMMON_REFS.bacnet, COMMON_REFS.ashraeBacnet]],
  ["bacnet-priority-array-commanding-reference", "BACnet Priority Array Commanding Reference", "Command conflicts are easier to troubleshoot when priority array ownership and relinquish behavior are documented.", "bacnet", [COMMON_REFS.bacnet, COMMON_REFS.ashraeBacnet]],
  ["bacnet-cov-subscription-checklist", "BACnet COV Subscription Checklist", "COV subscriptions reduce polling load only when lifetimes, confirmed notifications, and fallback polling are handled.", "bacnet", [COMMON_REFS.bacnet, COMMON_REFS.ashraeBacnet]],
  ["bas-vfd-network-integration-checklist", "VFD Network Integration Checklist for BAS", "VFD integrations need command ownership, safeties, feedback, speed references, fault reset rules, and local override handling.", "vfd", [COMMON_REFS.modbus, COMMON_REFS.bacnet]],
  ["bas-ntp-time-synchronization-checklist", "BAS NTP Time Synchronization Checklist", "Accurate time keeps trends, alarms, certificates, and audit records trustworthy across BAS platforms.", "networking", [COMMON_REFS.nist80082]],
  ["bas-tls-certificate-renewal-playbook", "BAS TLS Certificate Renewal Playbook", "Certificate renewal should be planned before expiry breaks web clients, supervisors, APIs, and station-to-station links.", "tls", [COMMON_REFS.nist80082, COMMON_REFS.cisaBas]],
  ["bas-security-zones-and-conduits-reference", "BAS Security Zones and Conduits Reference", "Segmenting BAS networks into zones and controlled conduits reduces lateral movement and clarifies firewall rules.", "security", [COMMON_REFS.nist80082, COMMON_REFS.cisaBas]],
  ["bas-remote-access-hardening-checklist", "BAS Remote Access Hardening Checklist", "Remote BAS access should use least privilege, MFA where available, logging, vendor accountability, and no public controller exposure.", "security", [COMMON_REFS.cisaBas, COMMON_REFS.nist80082]],
  ["ashrae-guideline-36-bas-sequence-review", "ASHRAE Guideline 36 BAS Sequence Review", "Guideline 36 is a useful reference point when reviewing high-performance HVAC control sequences and trend needs.", "commissioning", [COMMON_REFS.ashrae36]],
  ["dali-lighting-control-bas-integration", "DALI Lighting Control BAS Integration Checklist", "Lighting integration needs clear gateway ownership, group mapping, emergency lighting constraints, and command boundaries.", "lighting", [COMMON_REFS.dali]],
  ["bas-utility-metering-integration-checklist", "Utility Metering Integration Checklist for BAS", "Metering integrations need unit normalization, interval alignment, rollover handling, and demand-window documentation.", "meters", [COMMON_REFS.modbus, COMMON_REFS.bacnet]],
  ["bas-alarm-rationalization-checklist", "BAS Alarm Rationalization Checklist", "Alarm cleanup should separate life safety, equipment protection, comfort, maintenance, and nuisance notifications.", "alarms", [COMMON_REFS.nist80082]],
  ["bas-trend-retention-and-data-quality-checklist", "BAS Trend Retention and Data Quality Checklist", "Trend data is only useful when retention, intervals, units, time sync, and bad-data flags are managed deliberately.", "analytics", [COMMON_REFS.haystack, COMMON_REFS.nist80082]],
  ["bas-backup-restore-evidence-checklist", "BAS Backup and Restore Evidence Checklist", "A BAS backup is not complete until restore scope, version compatibility, credentials, licenses, and test evidence are documented.", "backup", [COMMON_REFS.nist80082]],
  ["bas-firewall-rule-request-template", "BAS Firewall Rule Request Template", "Firewall requests should describe source, destination, protocol, port, purpose, encryption, and operational owner.", "networking", [COMMON_REFS.nist80082, COMMON_REFS.cisaBas]],
  ["bas-graphics-operator-workflow-review", "BAS Graphics Operator Workflow Review", "Graphics should help operators diagnose equipment quickly instead of hiding points behind decorative screens.", "graphics", [COMMON_REFS.ashrae36]],
  ["bas-fdd-point-readiness-checklist", "Fault Detection Point Readiness Checklist", "FDD tools need reliable point metadata, units, histories, occupancy context, and equipment relationships before analytics can be trusted.", "analytics", [COMMON_REFS.haystack, COMMON_REFS.brick, COMMON_REFS.ashrae36]],
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function refMarkdown(refs) {
  return refs.map((ref) => `- [${ref.label}](${ref.url})`).join("\n");
}

function titleCaseSlug(slug) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function platformRefs(platform) {
  return [
    { label: platform.docLabel, url: platform.docUrl },
    { label: `${platform.vendor} product information`, url: platform.productUrl },
    COMMON_REFS.nist80082,
  ];
}

function platformArticle(platform, kind) {
  const baseFacet = platform.slug;
  const refs = platformRefs(platform);
  const common = {
    facets: [baseFacet, "integration", "guide"],
    references: refs,
  };

  if (kind === "commissioning") {
    return {
      ...common,
      title: `${platform.name} Commissioning Checklist`,
      slug: `${platform.slug}-commissioning-checklist`,
      categorySlug: "how-to",
      summary: `Field checklist for commissioning ${platform.name} using ${platform.vendor} source documentation, site records, and BAS verification evidence.`,
      facets: [baseFacet, "commissioning", "checklist"],
      content: `# ${platform.name} Commissioning Checklist

${platform.name} commissioning should start from the current ${platform.vendor} documentation for the exact product version, controller family, and licensed feature set. This checklist is the BAS-side working layer: it organizes what to verify, what evidence to keep, and what should not be assumed from a previous project.

## Use Case

Use this when a new ${platform.name} site, controller, supervisor, or integration is ready for functional checkout. The goal is not to replace vendor manuals. The goal is to make sure the field team turns official source material into repeatable evidence.

## Source Material to Collect

- Current ${platform.vendor} product documentation and release notes
- Approved controls drawings and network diagrams
- Point list, alarm list, trend list, and sequence of operation
- IP plan, controller addresses, credentials handoff, and backup location

## Procedure

1. Confirm the installed product family and software version against the vendor documentation.
2. Verify controller names, network addresses, site hierarchy, and equipment labels match the approved project records.
3. Check protocol boundaries. For this platform, expected integration paths may include ${platform.protocols}; confirm the actual enabled services before testing.
4. Validate each equipment graphic against live points, not just placeholder names.
5. Test commands with local safeties respected and document who owns each writable point.
6. Verify alarms include priority, routing, message text, and operator response expectations.
7. Confirm trends are collecting at useful intervals and that time sync is correct.
8. Export or capture a backup after successful checkout.

## Gotchas

- Do not copy a checklist from another release without checking the vendor documentation for changed features or terminology.
- Do not accept screenshots alone as commissioning proof. Keep raw trend, alarm, and point-status evidence where possible.
- Confirm optional licensed features before documenting a capability as available.

## Verification

The commissioning package is complete when the live site, vendor source material, point evidence, alarm evidence, trend evidence, network records, and backup location all agree.

## References

${refMarkdown(refs)}
`,
    };
  }

  if (kind === "integration") {
    return {
      ...common,
      title: `${platform.name} Integration Planning Guide`,
      slug: `${platform.slug}-integration-planning-guide`,
      categorySlug: "reference",
      summary: `Integration planning guide for ${platform.name}, focused on protocol boundaries, ownership, security, and verification.`,
      facets: [baseFacet, "integration", "networking", "reference"],
      content: `# ${platform.name} Integration Planning Guide

Integrating ${platform.name} with other BAS, analytics, or enterprise systems starts with a precise boundary: what data moves, who can command, which protocol is used, and which system remains authoritative.

## Integration Scope

Document the integration before configuring it:

- Source system and destination system
- Data direction: read-only telemetry, alarms, histories, or writable commands
- Protocol or API path, using ${platform.vendor} documentation as the source of truth
- Network path, firewall rules, TLS requirements, and owner for credentials
- Fallback behavior if the integration is offline

## Protocol Planning

${platform.name} deployments may involve ${platform.protocols}. Do not assume every protocol is enabled or licensed. Confirm the actual product version, device model, and feature set from the vendor documentation before promising interoperability.

## Data Mapping Checklist

1. Normalize units before publishing data downstream.
2. Preserve point quality/status where the protocol supports it.
3. Avoid ambiguous point names; include equipment, system, and measurement context.
4. Separate commands from telemetry in both naming and permissions.
5. Record polling rates or subscription behavior so the integration does not overload controllers.

## Security Checklist

- Use encrypted protocols where supported.
- Use service accounts with the smallest necessary permissions.
- Store credentials in the approved site password system, not drawings or spreadsheets.
- Log writes and administrative changes.
- Review firewall rules against actual source and destination hosts.

## Verification

An integration is ready when data maps match the source system, commands are proven with the right priority/ownership, stale-data behavior is tested, and rollback steps are documented.

## References

${refMarkdown(refs)}
`,
    };
  }

  if (kind === "operator") {
    return {
      ...common,
      title: `${platform.name} Operator Graphics and Alarm Review`,
      slug: `${platform.slug}-operator-graphics-alarm-review`,
      categorySlug: "best-practices",
      summary: `Review checklist for ${platform.name} graphics, alarms, trends, and operator workflow.`,
      facets: [baseFacet, "graphics", "alarms", "best-practices"],
      content: `# ${platform.name} Operator Graphics and Alarm Review

Operator screens are successful when a technician can identify the affected equipment, understand the current mode, see the controlling values, and take the correct next action. For ${platform.name}, graphics and alarms should be reviewed against the current ${platform.vendor} documentation and the approved sequence of operation.

## What to Review

- Equipment graphics show mode, status, command, feedback, alarms, setpoints, and key temperatures/pressures.
- Alarm text identifies the equipment, condition, expected response, and escalation path.
- Trend links or embedded charts exist for points needed to diagnose recurring faults.
- Navigation follows the building and equipment hierarchy used by operations staff.

## Operator Workflow Checklist

1. Start from a real alarm and confirm the graphic tells the operator what failed.
2. Verify command buttons show ownership and do not hide local/safety interlocks.
3. Confirm occupied/unoccupied schedules are easy to inspect.
4. Check that stale/offline points are visually different from normal values.
5. Review alarm floods and nuisance alarms before turnover.

## Gotchas

- A graphic that looks good but hides point quality will slow down troubleshooting.
- Alarm priorities copied from a template may not match the site risk.
- If the operator needs a separate spreadsheet to decode equipment names, the BAS navigation is not ready.

## Verification

Select five representative alarms and five common operator tasks. The operator should be able to complete each task from the ${platform.name} UI without searching through raw point folders.

## References

${refMarkdown(refs)}
`,
    };
  }

  return {
    ...common,
    title: `${platform.name} IT, Security, and Backup Handoff`,
    slug: `${platform.slug}-it-security-backup-handoff`,
    categorySlug: "best-practices",
    summary: `Handoff checklist for ${platform.name} network access, account ownership, backups, software versions, and restore evidence.`,
    facets: [baseFacet, "security", "backup", "networking", "checklist"],
    content: `# ${platform.name} IT, Security, and Backup Handoff

Every ${platform.name} site needs an IT and operations handoff that survives staff turnover. The handoff should be based on ${platform.vendor} documentation, current site configuration, and accepted operational technology security practices.

## Minimum Handoff Package

- Product version, controller models, supervisor/server roles, and licensed features
- Network diagram with IP addresses, VLANs, firewall rules, and remote access path
- Account list with owner, purpose, role, and emergency access process
- Backup location, restore scope, and date of last successful restore test
- Certificate and service-account expiry dates

## Security Checklist

1. Remove default credentials and unused accounts.
2. Use individual named accounts where supported.
3. Restrict writable access to approved roles.
4. Prefer encrypted management and integration paths.
5. Log remote access and administrative changes.
6. Keep vendor support access disabled unless it is actively needed and approved.

## Backup Checklist

- Confirm what the backup includes and excludes.
- Keep a copy outside the BAS server or controller.
- Record the software version needed to restore it.
- Test restore in a safe environment after major changes.
- Capture screenshots or logs proving backup success.

## Verification

The handoff is complete when IT can describe the required traffic, operations can restore from the latest backup, and the BAS owner knows who can make configuration changes.

## References

${refMarkdown(refs)}
`,
  };
}

function protocolArticle([slug, title, summary, facet, refs]) {
  const display = titleCaseSlug(facet);
  return {
    title,
    slug,
    summary,
    categorySlug: "reference",
    facets: [facet, "integration", "reference"],
    references: refs,
    content: `# ${title}

${summary}

## Use Case

Use this page when planning, troubleshooting, or reviewing a BAS integration that depends on ${display}. The exact implementation may vary by product, but the source-of-truth details should come from the linked standard, vendor, or official project documentation.

## What to Document

- Which device or application owns the data
- Whether the path is read-only telemetry, alarms, histories, or writable control
- Network transport, port, address, object/register/topic naming, and security settings
- Polling, subscription, lifetime, timeout, and retry behavior
- Unit scaling, data type, quality/status, and timestamp handling

## Field Checklist

1. Confirm the implementation against the official reference before using a vendor default.
2. Build a small test map first and verify values with live equipment.
3. Record how stale data, offline devices, and bad quality are represented.
4. Separate commands from telemetry and assign a clear owner for writes.
5. Test restart behavior on both sides of the integration.
6. Keep packet captures, screenshots, or exported mappings as turnover evidence.

## Common Failure Modes

- Addressing or namespace mistakes that make values appear valid but point to the wrong equipment
- Unit scaling errors, byte order errors, or missing engineering ranges
- Polling intervals that overload field controllers
- Firewalls or routing rules that permit initial discovery but block sustained operation
- Writes that bypass local safeties or conflict with another system's command priority

## Verification

The integration is ready when live values match an independent field check, offline behavior is visible, writes are controlled, and the mapping can be rebuilt from documented source material.

## References

${refMarkdown(refs)}
`,
  };
}

function buildGapArticles() {
  const platformArticles = PLATFORMS.flatMap((platform) => [
    platformArticle(platform, "commissioning"),
    platformArticle(platform, "integration"),
    platformArticle(platform, "operator"),
    platformArticle(platform, "security"),
  ]);
  const protocolArticles = PROTOCOL_TOPICS.map(protocolArticle);
  return [...platformArticles, ...protocolArticles].slice(0, ARTICLE_LIMIT);
}

function requiredFacetDefinitions(articles) {
  const defs = new Map();
  const add = (groupSlug, slug, name, description = null, displayOrder = 500) => {
    defs.set(`${groupSlug}:${slug}`, { groupSlug, slug, name, description, display_order: displayOrder });
  };

  PLATFORMS.forEach((platform, index) => {
    add("platform_vendor", platform.slug, platform.name, `${platform.vendor} BAS platform and field workflow articles`, 100 + index);
  });

  [
    ["integration", "Integration"],
    ["commissioning", "Commissioning"],
    ["networking", "Networking"],
    ["security", "Security"],
    ["backup", "Backup"],
    ["graphics", "Graphics"],
    ["alarms", "Alarms"],
    ["analytics", "Analytics"],
    ["meters", "Meters"],
    ["lighting", "Lighting"],
    ["vfd", "VFD"],
    ["tls", "TLS"],
  ].forEach(([slug, name], index) => add("topic", slug, name, null, 200 + index));

  [
    ["bacnet", "BACnet"],
    ["bacnet-sc", "BACnet/SC"],
    ["mstp", "BACnet MS/TP"],
    ["modbus", "Modbus"],
    ["knx", "KNX"],
    ["lonworks", "LonWorks"],
    ["opc-ua", "OPC UA"],
    ["obix", "oBIX"],
    ["mqtt", "MQTT"],
    ["sparkplug-b", "Sparkplug B"],
    ["haystack", "Project Haystack"],
    ["brick", "Brick Schema"],
  ].forEach(([slug, name], index) => add("protocol", slug, name, null, 200 + index));

  [
    ["checklist", "Checklist"],
    ["guide", "Guide"],
    ["reference", "Reference"],
    ["best-practices", "Best Practices"],
  ].forEach(([slug, name], index) => add("content_format", slug, name, null, 50 + index));

  for (const article of articles) {
    for (const facetSlug of article.facets) {
      if (![...defs.values()].some((def) => def.slug === facetSlug)) {
        add("topic", facetSlug, titleCaseSlug(facetSlug), null, 500);
      }
    }
  }

  return [...defs.values()];
}

async function rest(pathname, { method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${pathname} failed: ${response.status} ${text}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function selectAll(table, query = "select=*") {
  const pageSize = 1000;
  let offset = 0;
  const rows = [];
  while (true) {
    const page = await rest(`${table}?${query}&limit=${pageSize}&offset=${offset}`);
    rows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return rows;
}

async function upsert(table, rows, conflictColumns) {
  if (!rows.length) return [];
  return rest(`${table}?on_conflict=${encodeURIComponent(conflictColumns)}`, {
    method: "POST",
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}

function hasReferences(content = "") {
  return /(^|\n)##\s+References\b/i.test(content) && /\]\(https?:\/\//.test(content);
}

function sourceCount(content = "") {
  const refsSection = content.split(/\n##\s+References\b/i)[1] || "";
  return (refsSection.match(/https?:\/\//g) || []).length;
}

function weakPatchFor(article) {
  if (hasReferences(article.content)) return null;
  const slug = article.slug || "";
  const refs = [];
  if (slug.includes("niagara") || slug.includes("jace")) refs.push(COMMON_REFS.tridium);
  if (slug.includes("metasys") || slug.includes("sct") || slug.includes("jci")) refs.push(COMMON_REFS.jciDocs);
  if (slug.includes("bacnet") || slug.includes("mstp") || slug.includes("bbmd")) refs.push(COMMON_REFS.bacnet, COMMON_REFS.ashraeBacnet);
  if (slug.includes("modbus")) refs.push(COMMON_REFS.modbus);
  if (slug.includes("mqtt")) refs.push(COMMON_REFS.mqtt);
  if (slug.includes("sparkplug")) refs.push(COMMON_REFS.sparkplug);
  if (slug.includes("haystack")) refs.push(COMMON_REFS.haystack);
  if (slug.includes("brick")) refs.push(COMMON_REFS.brick);
  if (slug.includes("security") || slug.includes("hardening") || slug.includes("certificate") || slug.includes("tls")) {
    refs.push(COMMON_REFS.cisaBas, COMMON_REFS.nist80082);
  }
  if (!refs.length) return null;

  const uniqueRefs = [...new Map(refs.map((ref) => [ref.url, ref])).values()];
  return {
    ...article,
    content: `${article.content.trim()}

## References

${refMarkdown(uniqueRefs)}
`,
  };
}

function auditInventory(inventory, plannedArticles) {
  const existingSlugs = new Set(inventory.articles.map((article) => article.slug));
  const plannedSlugs = plannedArticles.map((article) => article.slug);
  const duplicatePlannedSlugs = plannedSlugs.filter((slug, index) => plannedSlugs.indexOf(slug) !== index);
  const existingMatches = plannedSlugs.filter((slug) => existingSlugs.has(slug));
  const noReferences = inventory.articles.filter((article) => !hasReferences(article.content || ""));
  const thin = inventory.articles.filter((article) => (article.content || "").length < 1200);
  const weakCandidates = inventory.articles.map(weakPatchFor).filter(Boolean);
  const termCounts = {};

  for (const article of inventory.articles) {
    const slug = article.slug || "";
    for (const term of [
      "niagara", "metasys", "bacnet", "modbus", "siemens", "schneider", "honeywell", "alerton",
      "automated", "carrier", "trane", "delta", "distech", "kmc", "abb", "belimo", "daikin",
      "easyio", "lynxspring", "loytec", "mqtt", "sparkplug", "haystack", "brick", "opc", "knx",
      "lonworks", "obix",
    ]) {
      if (slug.includes(term)) termCounts[term] = (termCounts[term] || 0) + 1;
    }
  }

  return {
    generated_at: new Date().toISOString(),
    live_article_count: inventory.articles.length,
    planned_article_count: plannedArticles.length,
    planned_duplicate_slugs: duplicatePlannedSlugs,
    planned_existing_slug_collisions: existingMatches,
    live_missing_references_count: noReferences.length,
    live_thin_article_count: thin.length,
    weak_reference_patch_candidates: weakCandidates.length,
    term_counts: termCounts,
    planned_articles: plannedArticles.map((article) => ({
      slug: article.slug,
      title: article.title,
      categorySlug: article.categorySlug,
      facets: article.facets,
      sourceCount: sourceCount(article.content),
    })),
    weak_candidates_sample: weakCandidates.slice(0, 50).map((article) => ({
      slug: article.slug,
      title: article.title,
    })),
  };
}

async function fetchInventory() {
  const [articles, categories, facetGroups, facets, articleFacets, collections, collectionArticles] = await Promise.all([
    selectAll("wiki_articles", "select=id,category_id,title,slug,summary,content,is_published,updated_at,created_at"),
    selectAll("wiki_categories", "select=id,name,slug,description,display_order,color"),
    selectAll("wiki_facet_groups", "select=id,name,slug,display_order"),
    selectAll("wiki_facets", "select=id,group_id,name,slug,description,display_order,article_count"),
    selectAll("wiki_article_facets", "select=article_id,facet_id"),
    selectAll("wiki_collections", "select=id,name,slug,description,cover_icon,is_featured,display_order"),
    selectAll("wiki_collection_articles", "select=collection_id,article_id,display_order"),
  ]);
  return { articles, categories, facetGroups, facets, articleFacets, collections, collectionArticles };
}

async function writeReports(inventory, audit) {
  await fs.mkdir(WORK_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const auditPath = path.join(WORK_DIR, `wiki-audit-${stamp}.json`);
  const inventoryPath = path.join(WORK_DIR, `wiki-inventory-${stamp}.json`);
  await fs.writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
  await fs.writeFile(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  return { auditPath, inventoryPath };
}

async function ensureCategories(categoriesBySlug) {
  const wanted = [
    { name: "Reference", slug: "reference", description: "Technical references, specifications, and lookup tables", icon_name: "Book", display_order: 5, color: "#06B6D4" },
    { name: "How-To", slug: "how-to", description: "Step-by-step tutorials and procedures", icon_name: "Book", display_order: 2, color: "#3B82F6" },
    { name: "Best Practices", slug: "best-practices", description: "Industry standards and recommended approaches", icon_name: "CheckCircle", display_order: 3, color: "#10B981" },
  ].filter((category) => !categoriesBySlug.has(category.slug));

  if (!wanted.length) return [];
  return upsert("wiki_categories", wanted, "slug");
}

async function applyBatch(inventory, articles) {
  const categoriesBySlug = new Map(inventory.categories.map((category) => [category.slug, category]));
  const createdCategories = await ensureCategories(categoriesBySlug);
  for (const category of createdCategories || []) categoriesBySlug.set(category.slug, category);

  const facetGroupsBySlug = new Map(inventory.facetGroups.map((group) => [group.slug, group]));
  const requiredGroups = [
    { name: "Platform / Vendor", slug: "platform_vendor", display_order: 1 },
    { name: "Protocol", slug: "protocol", display_order: 2 },
    { name: "Topic", slug: "topic", display_order: 4 },
    { name: "Content Format", slug: "content_format", display_order: 5 },
  ].filter((group) => !facetGroupsBySlug.has(group.slug));
  const createdGroups = await upsert("wiki_facet_groups", requiredGroups, "slug");
  for (const group of createdGroups || []) facetGroupsBySlug.set(group.slug, group);

  const facetDefs = requiredFacetDefinitions(articles).map((def) => ({
    group_id: facetGroupsBySlug.get(def.groupSlug)?.id,
    name: def.name,
    slug: def.slug,
    description: def.description,
    display_order: def.display_order,
  })).filter((def) => def.group_id);

  const upsertedFacets = await upsert("wiki_facets", facetDefs, "group_id,slug");
  const allFacets = [...inventory.facets, ...(upsertedFacets || [])];
  const facetsBySlug = new Map(allFacets.map((facet) => [facet.slug, facet]));

  const articleRows = articles.map((article) => ({
    category_id: categoriesBySlug.get(article.categorySlug)?.id || categoriesBySlug.get("reference")?.id || null,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    content: article.content,
    is_published: true,
    updated_at: new Date().toISOString(),
  }));

  const upsertedArticles = await upsert("wiki_articles", articleRows, "slug");
  const articleBySlug = new Map((upsertedArticles || []).map((article) => [article.slug, article]));

  const articleFacetRows = [];
  for (const article of articles) {
    const savedArticle = articleBySlug.get(article.slug);
    if (!savedArticle) continue;
    for (const facetSlug of article.facets) {
      const facet = facetsBySlug.get(facetSlug);
      if (facet) articleFacetRows.push({ article_id: savedArticle.id, facet_id: facet.id });
    }
  }
  await upsert("wiki_article_facets", articleFacetRows, "article_id,facet_id");

  const collections = [
    {
      name: "Vendor Field Guides",
      slug: "vendor-field-guides",
      description: "Field checklists for BAS platforms outside the usual Niagara and Metasys center of gravity.",
      cover_icon: "Buildings",
      is_featured: true,
      display_order: 5,
    },
    {
      name: "Protocols and Data Models",
      slug: "protocols-and-data-models",
      description: "Reference guides for BAS protocols, semantic models, APIs, and integration handoffs.",
      cover_icon: "Network",
      is_featured: true,
      display_order: 6,
    },
  ];
  const upsertedCollections = await upsert("wiki_collections", collections, "slug");
  const collectionBySlug = new Map((upsertedCollections || []).map((collection) => [collection.slug, collection]));
  const vendorCollection = collectionBySlug.get("vendor-field-guides");
  const protocolCollection = collectionBySlug.get("protocols-and-data-models");
  const collectionRows = [];
  for (const article of articles) {
    const savedArticle = articleBySlug.get(article.slug);
    if (!savedArticle) continue;
    const collection = article.slug.includes("checklist") && article.facets.some((facet) => PLATFORMS.some((platform) => platform.slug === facet))
      ? vendorCollection
      : protocolCollection;
    if (collection) {
      collectionRows.push({
        collection_id: collection.id,
        article_id: savedArticle.id,
        display_order: collectionRows.length + 1,
      });
    }
  }
  await upsert("wiki_collection_articles", collectionRows, "collection_id,article_id");

  let weakUpdated = [];
  if (FIX_WEAK) {
    weakUpdated = inventory.articles
      .map(weakPatchFor)
      .filter(Boolean)
      .slice(0, 50)
      .map((article) => ({
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        updated_at: new Date().toISOString(),
      }));
    await upsert("wiki_articles", weakUpdated, "slug");
  }

  return {
    articles_upserted: upsertedArticles?.length || 0,
    facets_upserted: upsertedFacets?.length || 0,
    article_facets_upserted: articleFacetRows.length,
    collections_upserted: upsertedCollections?.length || 0,
    collection_links_upserted: collectionRows.length,
    weak_articles_updated: weakUpdated.length,
  };
}

function validatePlannedArticles(articles) {
  const errors = [];
  const seen = new Set();
  for (const article of articles) {
    if (seen.has(article.slug)) errors.push(`Duplicate planned slug: ${article.slug}`);
    seen.add(article.slug);
    if (!article.title || !article.slug || !article.summary || !article.content) errors.push(`Missing required article field: ${article.slug}`);
    if (!article.categorySlug) errors.push(`Missing category: ${article.slug}`);
    if (!article.facets || article.facets.length < 2) errors.push(`Missing facets: ${article.slug}`);
    if (!hasReferences(article.content)) errors.push(`Missing references: ${article.slug}`);
    if (sourceCount(article.content) < 1) errors.push(`Missing source links: ${article.slug}`);
  }
  return errors;
}

async function main() {
  const articles = buildGapArticles();
  const validationErrors = validatePlannedArticles(articles);
  if (validationErrors.length) {
    console.error(validationErrors.join("\n"));
    process.exit(1);
  }

  console.log(`Fetching live wiki inventory from ${SUPABASE_URL}...`);
  const inventory = await fetchInventory();
  const audit = auditInventory(inventory, articles);
  const reportPaths = await writeReports(inventory, audit);

  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    live_article_count: audit.live_article_count,
    planned_article_count: audit.planned_article_count,
    planned_existing_slug_collisions: audit.planned_existing_slug_collisions.length,
    missing_references_count: audit.live_missing_references_count,
    weak_reference_patch_candidates: audit.weak_reference_patch_candidates,
    auditPath: reportPaths.auditPath,
    inventoryPath: reportPaths.inventoryPath,
  }, null, 2));

  if (!APPLY) return;

  const result = await applyBatch(inventory, articles);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
