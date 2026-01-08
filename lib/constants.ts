import {
  Tool,
  ToolDetail,
  UseCase,
  NavNode,
  VIEW_IDS,
} from "./types";

// =============================================================================
// VIEW TITLES - Used in toolbar, page transitions, etc.
// =============================================================================

export const VIEW_TITLES: Record<string, string> = {
  [VIEW_IDS.HOME]: "Home",
  [VIEW_IDS.TOOLS]: "Tools",
  [VIEW_IDS.NSK]: "NiagaraSidekick",
  [VIEW_IDS.SSK]: "SimulatorSidekick",
  [VIEW_IDS.MSK]: "MetasysSidekick",
  [VIEW_IDS.QSK]: "QR Sidekick",
  [VIEW_IDS.RESOURCES]: "Resources",
  [VIEW_IDS.BABEL]: "BAS Babel",
  [VIEW_IDS.REFERENCES]: "References",
  [VIEW_IDS.WIKI]: "Wiki",
  [VIEW_IDS.FORUM]: "Forum",
  [VIEW_IDS.PSK]: "ProjectSidekick",
  [VIEW_IDS.CALCULATORS]: "Calculators",
  [VIEW_IDS.ACCOUNT]: "Account",
  [VIEW_IDS.SIGNIN]: "Sign In",
  [VIEW_IDS.SIGNUP]: "Sign Up",
};

// Loading text for page transitions (uppercase, underscored)
export const VIEW_LOADING_TEXT: Record<string, string> = {
  [VIEW_IDS.HOME]: "HOME",
  [VIEW_IDS.TOOLS]: "TOOLS",
  [VIEW_IDS.NSK]: "NIAGARA_SIDEKICK",
  [VIEW_IDS.SSK]: "SIMULATOR_SIDEKICK",
  [VIEW_IDS.MSK]: "METASYS_SIDEKICK",
  [VIEW_IDS.QSK]: "QR_SIDEKICK",
  [VIEW_IDS.RESOURCES]: "RESOURCES",
  [VIEW_IDS.BABEL]: "BAS_BABEL",
  [VIEW_IDS.REFERENCES]: "REFERENCES",
  [VIEW_IDS.WIKI]: "WIKI",
  [VIEW_IDS.FORUM]: "FORUM",
  [VIEW_IDS.PSK]: "PROJECT_SIDEKICK",
  [VIEW_IDS.CALCULATORS]: "CALCULATORS",
  [VIEW_IDS.ACCOUNT]: "ACCOUNT",
  [VIEW_IDS.SIGNIN]: "SIGN_IN",
  [VIEW_IDS.SIGNUP]: "SIGN_UP",
};

// =============================================================================
// TOOLS DATA - Single source of truth for all tool information
// =============================================================================

export const TOOLS: Record<string, Tool> = {
  [VIEW_IDS.NSK]: {
    id: VIEW_IDS.NSK,
    name: "NiagaraSidekick",
    shortName: "NSK",
    tagline: "QA tool for Niagara stations",
    description: "Finds typos, compares templates, verifies points, generates clean reports.",
    status: "coming",
    iconName: "Desktop",
    webVersion: true,
    features: [
      "Template comparison",
      "Typo detection",
      "Point verification",
      "PDF report generation",
    ],
  },
  [VIEW_IDS.SSK]: {
    id: VIEW_IDS.SSK,
    name: "SimulatorSidekick",
    shortName: "SSK",
    tagline: "BACnet/Modbus simulator",
    description: "Create virtual devices in seconds for testing and development.",
    status: "coming",
    iconName: "WaveTriangle",
    webVersion: false,
    features: [
      "BACnet/IP simulation",
      "Modbus TCP/RTU support",
      "Multiple virtual devices",
      "Save/load templates",
    ],
  },
  [VIEW_IDS.MSK]: {
    id: VIEW_IDS.MSK,
    name: "MetasysSidekick",
    shortName: "MSK",
    tagline: "QA tool for Metasys systems",
    description: "Same power as NSK, built for JCI environments.",
    status: "coming",
    iconName: "Buildings",
    webVersion: false,
    features: [
      "Metasys integration",
      "Template comparison",
      "Typo detection",
      "PDF report generation",
    ],
  },
  [VIEW_IDS.QSK]: {
    id: VIEW_IDS.QSK,
    name: "QR Sidekick",
    shortName: "QSK",
    tagline: "Scan. Track. Control.",
    description: "The simplest way for field technicians to manage building equipment using QR codes.",
    status: "coming",
    iconName: "QrCode",
    webVersion: false,
    features: [
      "Instant QR scanning",
      "Live Niagara data",
      "Maintenance notes",
      "Cross-platform (iOS/Android)",
    ],
  },
};

// Array version for iteration
export const TOOLS_LIST = Object.values(TOOLS);

// =============================================================================
// TOOL DETAILS - Extended info for detail pages
// =============================================================================

export const TOOL_DETAILS: Record<string, ToolDetail> = {
  [VIEW_IDS.NSK]: {
    ...TOOLS[VIEW_IDS.NSK],
    detailedFeatures: [
      {
        iconName: "FileMagnifyingGlass",
        title: "Template Comparison",
        description: "Compare points against templates to find inconsistencies and deviations instantly.",
      },
      {
        iconName: "TextAa",
        title: "Typo Detection",
        description: "Smart analysis finds naming errors, misspellings, and formatting issues.",
      },
      {
        iconName: "CheckCircle",
        title: "Point Verification",
        description: "Validate point configurations against standards and best practices.",
      },
      {
        iconName: "FileText",
        title: "Report Generation",
        description: "Generate clean, professional PDF reports to share with customers.",
      },
    ],
    steps: [
      { number: 1, title: "Export or Connect", description: "Export station CSV or connect live to your Niagara station" },
      { number: 2, title: "Analyze", description: "NSK analyzes and groups points by template automatically" },
      { number: 3, title: "Review & Report", description: "Review findings, fix issues, and generate clean reports" },
    ],
    requirements: [
      { label: "Platform", value: "Windows 10+" },
      { label: "For live connection", value: "Niagara 4.x" },
      { label: "CSV works with", value: "Any Niagara version" },
    ],
  },
  [VIEW_IDS.SSK]: {
    ...TOOLS[VIEW_IDS.SSK],
    detailedFeatures: [
      {
        iconName: "WaveTriangle",
        title: "BACnet Simulation",
        description: "Create virtual BACnet devices with customizable object types and properties.",
      },
      {
        iconName: "Plugs",
        title: "Modbus Simulation",
        description: "Simulate Modbus TCP/RTU devices with configurable registers.",
      },
      {
        iconName: "Cpu",
        title: "Multiple Devices",
        description: "Run multiple virtual devices simultaneously for complex testing scenarios.",
      },
      {
        iconName: "FileText",
        title: "Templates",
        description: "Save and load device templates for quick setup on future projects.",
      },
    ],
    steps: [
      { number: 1, title: "Create Device", description: "Define your virtual device type and properties" },
      { number: 2, title: "Configure Points", description: "Add and configure simulated points" },
      { number: 3, title: "Start Simulation", description: "Run the simulator and connect your BAS" },
    ],
    requirements: [
      { label: "Platform", value: "Windows 10+" },
      { label: "BACnet", value: "BACnet/IP" },
      { label: "Modbus", value: "TCP & RTU" },
    ],
  },
  [VIEW_IDS.MSK]: {
    ...TOOLS[VIEW_IDS.MSK],
    detailedFeatures: [
      {
        iconName: "Buildings",
        title: "Metasys Integration",
        description: "Native support for Metasys system exports and configurations.",
      },
      {
        iconName: "FileMagnifyingGlass",
        title: "Template Comparison",
        description: "Compare points against templates to find inconsistencies.",
      },
      {
        iconName: "TextAa",
        title: "Typo Detection",
        description: "Smart analysis finds naming errors and formatting issues.",
      },
      {
        iconName: "FileText",
        title: "Report Generation",
        description: "Generate clean, professional PDF reports.",
      },
    ],
    steps: [
      { number: 1, title: "Export Data", description: "Export your Metasys system configuration" },
      { number: 2, title: "Analyze", description: "MSK analyzes and groups points automatically" },
      { number: 3, title: "Review & Report", description: "Review findings and generate reports" },
    ],
    requirements: [
      { label: "Platform", value: "Windows 10+" },
      { label: "Metasys Version", value: "10.x+" },
      { label: "Export Format", value: "CSV/XML" },
    ],
  },
  [VIEW_IDS.QSK]: {
    ...TOOLS[VIEW_IDS.QSK],
    mobileApp: true,
    detailedFeatures: [
      {
        iconName: "Scan",
        title: "Instant QR Scanning",
        description: "Scan equipment QR codes to pull up point values and status instantly.",
      },
      {
        iconName: "Gauge",
        title: "Live Niagara Data",
        description: "View real-time values when connected to the building network.",
      },
      {
        iconName: "Note",
        title: "Maintenance Notes",
        description: "Add dated notes for repairs, inspections, and observations.",
      },
      {
        iconName: "Lock",
        title: "Secure & Private",
        description: "Your data stays secure on your device and cloud storage.",
      },
    ],
    steps: [
      { number: 1, title: "Scan QR Code", description: "Point your phone at any equipment QR code" },
      { number: 2, title: "View Data", description: "See live point values, status, and history" },
      { number: 3, title: "Add Notes", description: "Record maintenance notes for your team" },
    ],
    requirements: [
      { label: "Platform", value: "iOS & Android" },
      { label: "For live data", value: "Building network connection" },
      { label: "Free tier", value: "5 equipment items" },
    ],
    useCases: [
      "Scan a rooftop unit to check discharge temps and fan status",
      "Scan a thermostat to pull up its associated VAV controller",
      "Scan a chiller to view operating parameters and alarms",
      "Scan any equipment to add maintenance notes for your team",
    ],
    perfectFor: [
      "HVAC technicians",
      "Building automation professionals",
      "Facility maintenance teams",
      "Controls contractors",
      "Property managers",
    ],
    pricing: [
      { name: "Free", limit: "5 items", price: "$0" },
      { name: "Basic", limit: "50 items", price: "$3/month" },
      { name: "Pro", limit: "100 items", price: "$5/month" },
      { name: "Unlimited", limit: "Unlimited", price: "$10/month" },
    ],
  },
};

// =============================================================================
// USE CASES - For tools page
// =============================================================================

export const USE_CASES: UseCase[] = [
  {
    title: "Commissioning a new building",
    description: "Verify point configurations and simulate devices before go-live",
    tools: ["NSK", "SSK"],
  },
  {
    title: "QA check before handoff",
    description: "Generate clean reports showing all points are correctly configured",
    tools: ["NSK", "MSK"],
  },
  {
    title: "Testing integrations offline",
    description: "Simulate BACnet/Modbus devices without physical hardware",
    tools: ["SSK"],
  },
  {
    title: "Metasys site audit",
    description: "Review and document Metasys system configurations",
    tools: ["MSK"],
  },
  {
    title: "Field equipment tracking",
    description: "Scan QR codes to view live data and add maintenance notes",
    tools: ["QSK"],
  },
];

// =============================================================================
// NAVIGATION - Tree structure for sidebar
// =============================================================================

export const NAV_ITEMS: NavNode[] = [
  {
    id: VIEW_IDS.TOOLS,
    label: "TOOLS",
    iconName: "Wrench",
    defaultExpanded: true,
    children: [
      {
        id: VIEW_IDS.NSK,
        label: "NiagaraSidekick",
        iconName: "Desktop",
      },
      {
        id: VIEW_IDS.SSK,
        label: "SimulatorSidekick",
        iconName: "WaveTriangle",
      },
      {
        id: VIEW_IDS.MSK,
        label: "MetasysSidekick",
        iconName: "Buildings",
      },
      {
        id: VIEW_IDS.QSK,
        label: "QR Sidekick",
        iconName: "QrCode",
      },
    ],
  },
  {
    id: VIEW_IDS.RESOURCES,
    label: "RESOURCES",
    iconName: "Book",
    defaultExpanded: true,
    children: [
      { id: VIEW_IDS.BABEL, label: "BAS Babel", iconName: "Translate" },
      { id: VIEW_IDS.CALCULATORS, label: "Calculators", iconName: "Calculator" },
      { id: VIEW_IDS.FORUM, label: "Forum", iconName: "Chats" },
      { id: VIEW_IDS.PSK, label: "ProjectSidekick", iconName: "Kanban" },
      { id: VIEW_IDS.REFERENCES, label: "References", iconName: "BookmarksSimple" },
      { id: VIEW_IDS.WIKI, label: "Wiki", iconName: "BookOpen" },
    ],
  },
  {
    id: VIEW_IDS.ACCOUNT,
    label: "ACCOUNT",
    iconName: "User",
    defaultExpanded: false,
    children: [
      { id: VIEW_IDS.SIGNIN, label: "Sign In", iconName: "SignIn" },
      { id: VIEW_IDS.SIGNUP, label: "Sign Up", iconName: "UserPlus" },
    ],
  },
];

// =============================================================================
// ICON MAP - Centralized icon name to component mapping
// =============================================================================

// Note: Icons are mapped in components since they need React imports
// This provides the valid icon names
export const ICON_NAMES = [
  "Wrench",
  "Book",
  "User",
  "Desktop",
  "WaveTriangle",
  "Buildings",
  "BookOpen",
  "BookmarksSimple",
  "Chats",
  "Kanban",
  "Calculator",
  "SignIn",
  "UserPlus",
  "FileMagnifyingGlass",
  "TextAa",
  "CheckCircle",
  "FileText",
  "Plugs",
  "Cpu",
  "Translate",
  "QrCode",
  "DeviceMobile",
  "Scan",
  "Note",
  "Lock",
  "Thermometer",
  "Gauge",
  "Fan",
  "WarningCircle",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
