import { ReactNode } from "react";

// Tool status
export type ToolStatus = "coming";

// Base tool info (used in listings)
export interface Tool {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  status: ToolStatus;
  iconName: string;
  features: string[];
  webVersion?: boolean;
}

// Extended feature info (used in detail pages)
export interface ToolFeature {
  iconName: string;
  title: string;
  description: string;
}

// Step info for "how it works" sections
export interface ToolStep {
  number: number;
  title: string;
  description: string;
}

// Requirement info
export interface ToolRequirement {
  label: string;
  value: string;
}

// Pricing tier for tools with subscription pricing
export interface ToolPricingTier {
  name: string;
  limit: string;
  price: string;
  highlighted?: boolean;
}

// Full tool detail (used in detail pages)
export interface ToolDetail extends Tool {
  detailedFeatures: ToolFeature[];
  steps: ToolStep[];
  requirements: ToolRequirement[];
  pricing?: ToolPricingTier[];
  mobileApp?: boolean;
  useCases?: string[];
  perfectFor?: string[];
}

// Use case for tools page
export interface UseCase {
  title: string;
  description: string;
  tools: string[];
}

// Navigation tree node
export interface NavNode {
  id: string;
  label: string;
  iconName?: string;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  children?: NavNode[];
  defaultExpanded?: boolean;
}

// View IDs as const for type safety
export const VIEW_IDS = {
  HOME: "home",
  TOOLS: "tools",
  NSK: "nsk",
  SSK: "ssk",
  MSK: "msk",
  QSK: "qsk",
  RESOURCES: "resources",
  BABEL: "babel",
  REFERENCES: "references",
  WIKI: "wiki",
  FORUM: "forum",
  PSK: "psk",
  CALCULATORS: "calculators",
  ACCOUNT: "account",
  SIGNIN: "signin",
  SIGNUP: "signup",
} as const;

export type ViewId = (typeof VIEW_IDS)[keyof typeof VIEW_IDS];

// License from Lemon Squeezy purchases
export interface License {
  id: string;
  product_id: string; // 'nsk', 'ssk', 'msk'
  license_key: string;
  lemon_squeezy_order_id: string | null;
  purchased_at: string;
  expires_at: string | null; // null = lifetime
  is_active: boolean;
}

// User profile from Supabase
export interface Profile {
  id: string;
  display_name: string | null;
  company: string | null;
  subscription_tier: string | null;
  entitlements: {
    tools: string[];
    features: string[];
    limits: {
      max_agents: number;
      max_devices: number;
    };
  } | null;
  post_count: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Forum types
export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  created_at: string;
  thread_count?: number;
  post_count?: number;
}

export interface ForumThread {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  slug: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  last_post_at: string | null;
  // Joined data
  author?: { display_name: string | null };
  reply_count?: number;
  last_post_author?: { display_name: string | null };
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null };
}

// Wiki types
export interface WikiCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  created_at: string;
  // Computed/joined
  children?: WikiCategory[];
  article_count?: number;
}

export interface WikiTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface WikiArticle {
  id: string;
  category_id: string | null;
  author_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null };
  category?: { name: string; slug: string };
  tags?: WikiTag[];
}

export interface WikiComment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { display_name: string | null };
}

// Wiki suggestion (forum thread → wiki article)
export interface WikiSuggestion {
  id: string;
  thread_id: string;
  suggested_by: string;
  suggested_at: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  // Joined data
  thread?: { title: string; slug: string };
  suggester?: { display_name: string | null };
  reviewer?: { display_name: string | null };
}

// Project Manager (PSK) types
export type PSKKanbanStatus = "backlog" | "in-progress" | "review" | "completed";
export type PSKTaskStatus = "todo" | "in-progress" | "completed";
export type PSKTaskPriority = "low" | "medium" | "high";
export type PSKWorkspaceType = "personal" | "company";
export type PSKMemberRole = "owner" | "member";

// Company/Team collaboration
export interface PSKCompany {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
  // Joined data
  members?: PSKCompanyMember[];
  member_count?: number;
}

export interface PSKCompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: PSKMemberRole;
  joined_at: string;
  // Joined data
  profile?: { display_name: string | null };
}

export interface PSKWorkspaceContext {
  type: PSKWorkspaceType;
  companyId: string | null;
  companyName: string | null;
}

export interface PSKClientContact {
  name: string;
  email?: string;
  phone?: string;
}

export interface PSKClient {
  id: string;
  user_id: string;
  company_id: string | null;
  name: string;
  contacts: PSKClientContact[];
  logo: string | null;
  color_palette: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PSKProject {
  id: string;
  user_id: string;
  company_id: string | null;
  created_by: string | null;
  client_id: string | null;
  name: string;
  description: string | null;
  status: PSKKanbanStatus;
  color: string | null;
  is_internal: boolean;
  is_archived: boolean;
  proton_drive_link: string | null;
  due_date: string | null;
  notes: string | null;
  budget: number | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: PSKClient;
  creator?: { display_name: string | null };
}

export interface PSKTask {
  id: string;
  user_id: string;
  created_by: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  status: PSKTaskStatus;
  priority: PSKTaskPriority;
  due_date: string | null;
  completed_at: string | null;
  is_daily: boolean;
  missed_date: string | null;
  created_at: string;
  // Joined data
  project?: PSKProject;
  creator?: { display_name: string | null };
}

export interface PSKTimeEntry {
  id: string;
  user_id: string;
  created_by: string | null;
  project_id: string;
  description: string | null;
  duration: number; // minutes
  date: string;
  created_at: string;
  // Joined data
  project?: PSKProject;
  creator?: { display_name: string | null };
}

export interface PSKBudgetLineItem {
  id: string;
  user_id: string;
  created_by: string | null;
  project_id: string;
  description: string;
  cost: number;
  category: string | null;
  date: string | null;
  created_at: string;
  // Joined data
  creator?: { display_name: string | null };
}

export interface PSKFile {
  id: string;
  user_id: string;
  created_by: string | null;
  project_id: string;
  name: string;
  type: string | null;
  size: number | null;
  url: string;
  uploaded_at: string;
  // Joined data
  creator?: { display_name: string | null };
}

// BAS Babel types
export interface BabelTypicalRange {
  min: number;
  max: number;
}

export interface BabelAliases {
  common: string[];
  abbreviated?: string[];
  verbose?: string[];
  misspellings?: string[];
}

export interface BabelPointConcept {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  haystack?: string;
  brick?: string;
  unit?: string;
  typical_range?: BabelTypicalRange;
  object_type?: string;
  engineering_units?: string;
}

export interface BabelPointEntry {
  concept: BabelPointConcept;
  aliases: BabelAliases;
  notes?: string[];
  related?: string[];
}

export interface BabelEquipmentSubtype {
  id: string;
  name: string;
  aliases?: string[];
  description?: string;
}

export interface BabelEquipmentEntry {
  id: string;
  name: string;
  full_name?: string;
  abbreviation?: string;
  category: string;
  description: string;
  haystack?: string;
  brick?: string;
  aliases: BabelAliases;
  subtypes?: BabelEquipmentSubtype[];
  typical_points?: string[];
}

export interface BabelCategory {
  id: string;
  name: string;
  type: "points" | "equipment";
  count: number;
  subcategories?: BabelCategory[];
}

export interface BabelSearchIndexEntry {
  id: string;
  type: "point" | "equipment";
  name: string;
  tokens: string[];
}

export interface BabelData {
  version: string;
  lastUpdated: string;
  totalPoints: number;
  totalEquipment: number;
  points: BabelPointEntry[];
  equipment: BabelEquipmentEntry[];
}

export interface BabelCategoriesData {
  version: string;
  categories: BabelCategory[];
}

export interface BabelSearchIndexData {
  version: string;
  entries: BabelSearchIndexEntry[];
}
