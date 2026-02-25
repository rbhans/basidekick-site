import {
  Tool,
  ToolDetail,
  UseCase,
  NavNode,
  Resource,
  VIEW_IDS,
} from "./types";
import { ROUTES } from "./routes";

// =============================================================================
// VIEW TITLES - Used in toolbar, page transitions, etc.
// =============================================================================

export const VIEW_TITLES: Record<string, string> = {
  [VIEW_IDS.HOME]: "Home",
  [VIEW_IDS.TOOLS]: "Tools",
  [VIEW_IDS.SSK]: "SimulatorSidekick",
  [VIEW_IDS.QSK]: "QR Sidekick",
  [VIEW_IDS.RESOURCES]: "Resources",
  [VIEW_IDS.ATLAS]: "BAS Atlas",
  [VIEW_IDS.BABEL]: "BAS Atlas",
  [VIEW_IDS.EQUIPMENT]: "BAS Atlas",
  [VIEW_IDS.REFERENCES]: "References",
  [VIEW_IDS.WIKI]: "Wiki",
  [VIEW_IDS.POINTSTACK]: "PointStack",

  [VIEW_IDS.CALCULATORS]: "Calculators",
  [VIEW_IDS.ACCOUNT]: "Account",
  [VIEW_IDS.SIGNIN]: "Sign In",
  [VIEW_IDS.SIGNUP]: "Sign Up",
};

// Loading text for page transitions (uppercase, underscored)
export const VIEW_LOADING_TEXT: Record<string, string> = {
  [VIEW_IDS.HOME]: "HOME",
  [VIEW_IDS.TOOLS]: "TOOLS",
  [VIEW_IDS.SSK]: "SIMULATOR_SIDEKICK",
  [VIEW_IDS.QSK]: "QR_SIDEKICK",
  [VIEW_IDS.RESOURCES]: "RESOURCES",
  [VIEW_IDS.ATLAS]: "BAS_ATLAS",
  [VIEW_IDS.BABEL]: "BAS_ATLAS",
  [VIEW_IDS.EQUIPMENT]: "BAS_ATLAS",
  [VIEW_IDS.REFERENCES]: "REFERENCES",
  [VIEW_IDS.WIKI]: "WIKI",
  [VIEW_IDS.POINTSTACK]: "POINTSTACK",

  [VIEW_IDS.CALCULATORS]: "CALCULATORS",
  [VIEW_IDS.ACCOUNT]: "ACCOUNT",
  [VIEW_IDS.SIGNIN]: "SIGN_IN",
  [VIEW_IDS.SIGNUP]: "SIGN_UP",
};

// =============================================================================
// TOOLS DATA - Single source of truth for all tool information
// =============================================================================

export const TOOLS: Record<string, Tool> = {
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
// RESOURCES DATA - Free resources
// =============================================================================

export const RESOURCES: Resource[] = [
  {
    id: "rust",
    name: "Rust",
    shortName: "Rust",
    tagline: "Open source BAS crates",
    description: "Protocol crates for open source BAS software in Rust, starting with rustbac for BACnet.",
    iconName: "Cpu",
    href: ROUTES.RESOURCES_RUST,
  },
  {
    id: VIEW_IDS.ATLAS,
    name: "BAS Atlas",
    shortName: "Atlas",
    tagline: "Points + equipment",
    description: "Unified BAS reference for point naming standards and equipment catalog browsing.",
    iconName: "Gauge",
    href: ROUTES.ATLAS,
  },
  {
    id: VIEW_IDS.CALCULATORS,
    name: "Calculators",
    shortName: "Calc",
    tagline: "HVAC & electrical calculators",
    description: "CFM, BTU, duct sizing, and other common calculations for BAS professionals.",
    iconName: "Calculator",
    href: `/${VIEW_IDS.CALCULATORS}`,
  },

  {
    id: VIEW_IDS.REFERENCES,
    name: "References",
    shortName: "Refs",
    tagline: "Quick reference sheets",
    description: "Protocol specs, wiring diagrams, and cheat sheets for common BAS tasks.",
    iconName: "BookmarksSimple",
    href: `/${VIEW_IDS.REFERENCES}`,
  },
];

// =============================================================================
// TOOL DETAILS - Extended info for detail pages
// =============================================================================

export const TOOL_DETAILS: Record<string, ToolDetail> = {
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
    tools: ["SSK"],
  },
  {
    title: "Testing integrations offline",
    description: "Simulate BACnet/Modbus devices without physical hardware",
    tools: ["SSK"],
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
    colorVariant: "tools",
    defaultExpanded: true,
    children: [
      {
        id: VIEW_IDS.SSK,
        label: "SimulatorSidekick",
        iconName: "WaveTriangle",
        colorVariant: "tools",
      },
      {
        id: VIEW_IDS.QSK,
        label: "QR Sidekick",
        iconName: "QrCode",
        colorVariant: "tools",
      },
    ],
  },
  {
    id: VIEW_IDS.POINTSTACK,
    label: "POINTSTACK",
    iconName: "UsersThree",
    colorVariant: "pointstack",
    defaultExpanded: true,
    children: [
      {
        id: "pointstack-feed",
        label: "Feed",
        iconName: "Chats",
        colorVariant: "pointstack",
        href: "/pointstack",
        exact: true,
      },
      {
        id: "pointstack-people",
        label: "People",
        iconName: "UsersThree",
        colorVariant: "pointstack",
        href: "/pointstack/people",
      },
      {
        id: "pointstack-companies",
        label: "Companies",
        iconName: "Buildings",
        colorVariant: "pointstack",
        href: "/pointstack/companies",
      },
      {
        id: "pointstack-jobs",
        label: "Jobs",
        iconName: "Briefcase",
        colorVariant: "pointstack",
        href: "/pointstack/jobs",
      },
      {
        id: "pointstack-resources",
        label: "Resources",
        iconName: "Folder",
        colorVariant: "pointstack",
        href: "/pointstack/resources",
      },
      {
        id: "pointstack-messages",
        label: "Messages",
        iconName: "ChatCircle",
        colorVariant: "pointstack",
        href: "/pointstack/messages",
      },
      {
        id: "pointstack-notifications",
        label: "Notifications",
        iconName: "Bell",
        colorVariant: "pointstack",
        href: "/pointstack/notifications",
      },
    ],
  },
  {
    id: VIEW_IDS.RESOURCES,
    label: "RESOURCES",
    iconName: "Book",
    colorVariant: "resources",
    defaultExpanded: true,
    children: [
      { id: VIEW_IDS.ATLAS, label: "BAS Atlas", iconName: "Gauge", colorVariant: "resources" },
      { id: "resources-rust", label: "Rust", iconName: "Cpu", colorVariant: "resources", href: ROUTES.RESOURCES_RUST },
      { id: VIEW_IDS.CALCULATORS, label: "Calculators", iconName: "Calculator", colorVariant: "resources" },

      { id: VIEW_IDS.REFERENCES, label: "References", iconName: "BookmarksSimple", colorVariant: "resources" },
      { id: VIEW_IDS.WIKI, label: "Wiki", iconName: "BookOpen", colorVariant: "wiki" },
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
  "UsersThree",
  "Bell",
  "ChatCircle",
  "Briefcase",
  "Image",
  "Question",
  "Lightbulb",
  "ArrowUp",
  "ArrowDown",
  "Share",
  "Flag",
  "MapPin",
  "Link",
  "PaperPlaneTilt",
  "Folder",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
