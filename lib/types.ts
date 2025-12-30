import { ReactNode } from "react";

// Tool status
export type ToolStatus = "ready" | "dev";

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

// Full tool detail (used in detail pages)
export interface ToolDetail extends Tool {
  detailedFeatures: ToolFeature[];
  steps: ToolStep[];
  requirements: ToolRequirement[];
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
  RESOURCES: "resources",
  WIKI: "wiki",
  FORUM: "forum",
  PSK: "psk",
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
  user_id: string;
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
  user_id: string;
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
