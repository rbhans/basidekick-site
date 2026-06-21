import { NavNode, Resource, VIEW_IDS } from "./types";
import { ROUTES } from "./routes";

// =============================================================================
// VIEW TITLES - Used in toolbar, page transitions, etc.
// =============================================================================

export const VIEW_TITLES: Record<string, string> = {
  [VIEW_IDS.HOME]: "Home",
  [VIEW_IDS.TOOLS]: "Tools",
  [VIEW_IDS.RESOURCES]: "Resources",
  [VIEW_IDS.ATLAS]: "BAS Atlas",
  [VIEW_IDS.BABEL]: "BAS Atlas",
  [VIEW_IDS.EQUIPMENT]: "BAS Atlas",
  [VIEW_IDS.REFERENCES]: "References",
  [VIEW_IDS.WIKI]: "Wiki",
  [VIEW_IDS.POINTSTACK]: "PointStack",
  [VIEW_IDS.OPEN_SOURCE]: "Community Share",

  [VIEW_IDS.CALCULATORS]: "Calculators",
  [VIEW_IDS.ACCOUNT]: "Account",
  [VIEW_IDS.SIGNIN]: "Sign In",
  [VIEW_IDS.SIGNUP]: "Sign Up",
};

// Loading text for page transitions (uppercase, underscored)
export const VIEW_LOADING_TEXT: Record<string, string> = {
  [VIEW_IDS.HOME]: "HOME",
  [VIEW_IDS.TOOLS]: "TOOLS",
  [VIEW_IDS.RESOURCES]: "RESOURCES",
  [VIEW_IDS.ATLAS]: "BAS_ATLAS",
  [VIEW_IDS.BABEL]: "BAS_ATLAS",
  [VIEW_IDS.EQUIPMENT]: "BAS_ATLAS",
  [VIEW_IDS.REFERENCES]: "REFERENCES",
  [VIEW_IDS.WIKI]: "WIKI",
  [VIEW_IDS.POINTSTACK]: "POINTSTACK",
  [VIEW_IDS.OPEN_SOURCE]: "COMMUNITY_SHARE",

  [VIEW_IDS.CALCULATORS]: "CALCULATORS",
  [VIEW_IDS.ACCOUNT]: "ACCOUNT",
  [VIEW_IDS.SIGNIN]: "SIGN_IN",
  [VIEW_IDS.SIGNUP]: "SIGN_UP",
};

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
// NAVIGATION - Tree structure for sidebar
// =============================================================================

export const NAV_ITEMS: NavNode[] = [
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
    id: VIEW_IDS.ATLAS,
    label: "BAS ATLAS",
    iconName: "Gauge",
    colorVariant: "resources",
  },
  {
    id: VIEW_IDS.OPEN_SOURCE,
    label: "COMMUNITY SHARE",
    iconName: "Cpu",
    colorVariant: "resources",
    href: ROUTES.OPEN_SOURCE,
  },
  {
    id: VIEW_IDS.WIKI,
    label: "WIKI",
    iconName: "BookOpen",
    colorVariant: "wiki",
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
