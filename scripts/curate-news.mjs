#!/usr/bin/env node
/**
 * BASidekick News Curator
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   node scripts/curate-news.mjs
 *
 * Requires:
 *   - SUPABASE_URL  (same as NEXT_PUBLIC_SUPABASE_URL)
 *   - SUPABASE_SERVICE_KEY  (service role key, bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── ARTICLES TO INSERT ───────────────────────────────────────────────────────
// Curated April 8, 2026 — sources from April 6-8, 2026 and late March 2026
const ARTICLES = [
  {
    title: "How HVAC Contractors Can Navigate the 'Age of Electricity'",
    url: "https://www.achrnews.com/articles/166031-how-hvac-contractors-can-navigate-the-age-of-electricity",
    slug: "how-hvac-contractors-can-navigate-the-age-of-elect-m2p7k4n9",
    source_domain: "achrnews.com",
    summary:
      "As heat pump sales now outpace gas furnaces nationally, ACHR News examines the practical gaps for contractors: cold-climate sizing expertise, electrical panel coordination, and utility permitting workflows — plus the cash-flow math of why a 5% average net margin isn't sustainable as jobs grow more complex.",
    tags: ["hvac", "controls", "energy", "sustainability"],
  },
  {
    title: "Shaping Intelligence: How Our Built Environment Must Guide AI Before It Guides Us",
    url: "https://www.automatedbuildings.com/2026/04/shaping-intelligence-how-our-built-environment-must-guide-ai-before-it-guides-us/",
    slug: "shaping-intelligence-how-our-built-environment-mus-b4t8r2x6",
    source_domain: "automatedbuildings.com",
    summary:
      "AutomatedBuildings.com's April 2026 theme examines why the built environment's safety constraints, liability structures, and long asset lifecycles must actively shape AI deployment frameworks — not passively adapt to them — as agentic AI moves closer to autonomous building control.",
    tags: ["ai", "smart-building", "controls", "analytics"],
  },
  {
    title: "The Building Revolution: Is AI About to Eat Your Smart Building Stack?",
    url: "https://www.automatedbuildings.com/2026/04/the-building-revolution-is-ai-about-to-eat-your-smart-building-stack/",
    slug: "the-building-revolution-is-ai-about-to-eat-your-sm-c9k3m5p1",
    source_domain: "automatedbuildings.com",
    summary:
      "AutomatedBuildings.com revisits its 'Smarter Stack' framework in the AI era, asking whether the layered architecture model integrators have relied on for technology selection still holds when AI can now span and subsume multiple stack layers simultaneously.",
    tags: ["ai", "smart-building", "controls", "iot"],
  },
  {
    title: "Iran Conflict Highlights Cyberthreat Exposure of U.S. Facilities",
    url: "https://www.facilitiesdive.com/news/iran-conflict-highlights-cyberthreat-exposure-of-us-facilities/816215/",
    slug: "iran-conflict-highlights-cyberthreat-exposure-of-u-j7n3t5w8",
    source_domain: "facilitiesdive.com",
    summary:
      "State-backed actors linked to the Iran conflict are actively targeting cyber-physical building systems; a WiredScore resiliency report warns that BMS and connected building infrastructure — often not designed with security in mind — have dramatically expanded commercial real estate's attack surface.",
    tags: ["cybersecurity", "smart-building", "iot", "controls"],
  },
  {
    title: "Iran-Linked Hackers Disrupt U.S. Critical Infrastructure by Targeting Internet-Exposed PLCs",
    url: "https://thehackernews.com/2026/04/iran-linked-hackers-disrupt-us-critical.html",
    slug: "iran-linked-hackers-disrupt-u-s-critical-infrastru-p9k2n4t6",
    source_domain: "thehackernews.com",
    summary:
      "A joint CISA/FBI/NSA/DOE advisory released April 7 details how Iranian-affiliated group Handala exploited internet-exposed Rockwell Allen-Bradley PLCs across government facilities, water, and energy sectors since March 2026 — a direct call to action for any integrator with OT devices reachable from the internet.",
    tags: ["cybersecurity", "controls", "ddc", "iot"],
  },
  {
    title: "Five Global Trends Reshaping Building Automation",
    url: "https://www.johnsoncontrols.com/building-insights/2026/thought-leadership/five-global-trends-reshaping-building-automation",
    slug: "five-global-trends-reshaping-building-automation-p4n6k8r2",
    source_domain: "johnsoncontrols.com",
    summary:
      "Johnson Controls' 2026 thought leadership piece identifies five forces reshaping BAS: rising energy costs, stricter decarbonization mandates, aging infrastructure (68% of U.S. offices predate 2000), AI-driven predictive maintenance, and workforce shortages — with 76% of organizations planning AI deployment for building operations.",
    tags: ["hvac", "energy", "ai", "retrofit", "controls", "smart-building"],
  },
  {
    title: "Siemens and Viakoo Deliver Advanced OT/IoT Security Management",
    url: "https://news.siemens.com/en-us/siemens-viakoo-deliver-advanced-security-management/",
    slug: "siemens-and-viakoo-deliver-advanced-ot-iot-securit-r5k8m2p4",
    source_domain: "news.siemens.com",
    summary:
      "Siemens Smart Infrastructure has integrated Viakoo's Action Platform to offer customers automated OT/IoT security management — covering firmware updates, certificate enforcement, and password hygiene — for large, distributed fleets of physical security devices and building IoT systems.",
    tags: ["cybersecurity", "iot", "smart-building", "controls"],
  },
];

// ─── STEP 1: RETIRE STALE AI ARTICLES ────────────────────────────────────────
async function retireStaleArticles() {
  console.log("\n📤 Step 1: Retiring stale AI-curated articles (older than 7 days)...");
  const { data, error, count } = await supabase
    .from("news_articles")
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq("is_ai_submitted", true)
    .eq("is_published", true)
    .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .select("id");

  if (error) {
    console.error("  ❌ Error retiring articles:", error.message);
    return 0;
  }
  const retiredCount = data?.length ?? 0;
  console.log(`  ✅ Retired ${retiredCount} stale articles`);
  return retiredCount;
}

// ─── STEP 2: GET EXISTING URLS ────────────────────────────────────────────────
async function getExistingUrls() {
  console.log("\n🔍 Step 2: Fetching existing article URLs (last 30 days)...");
  const { data, error } = await supabase
    .from("news_articles")
    .select("url")
    .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error("  ❌ Error fetching URLs:", error.message);
    return new Set();
  }
  const urls = new Set(data.map((r) => r.url));
  console.log(`  ✅ Found ${urls.size} existing URLs`);
  return urls;
}

// ─── STEP 3 & 4: INSERT NEW ARTICLES ─────────────────────────────────────────
async function insertArticles(existingUrls) {
  console.log("\n📥 Step 3-4: Inserting new articles...");
  const inserted = [];
  const skipped = [];

  for (const article of ARTICLES) {
    if (existingUrls.has(article.url)) {
      skipped.push({ ...article, reason: "duplicate URL" });
      console.log(`  ⏭️  Skipped (duplicate): ${article.title}`);
      continue;
    }

    const { error } = await supabase.from("news_articles").upsert(
      {
        title: article.title,
        url: article.url,
        slug: article.slug,
        source_domain: article.source_domain,
        summary: article.summary,
        submitted_by: null,
        is_ai_submitted: true,
        tags: article.tags,
        is_published: true,
        published_at: new Date().toISOString(),
      },
      { onConflict: "url", ignoreDuplicates: true }
    );

    if (error) {
      console.error(`  ❌ Failed to insert "${article.title}":`, error.message);
      skipped.push({ ...article, reason: error.message });
    } else {
      inserted.push(article);
      console.log(`  ✅ Inserted: ${article.title}`);
    }
  }

  return { inserted, skipped };
}

// ─── STEP 5: REPORT ──────────────────────────────────────────────────────────
async function getActiveAiCount() {
  const { count, error } = await supabase
    .from("news_articles")
    .select("*", { count: "exact", head: true })
    .eq("is_ai_submitted", true)
    .eq("is_published", true);

  if (error) {
    console.error("  ❌ Error counting active articles:", error.message);
    return "?";
  }
  return count;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🤖 BASidekick News Curator — April 8, 2026 — " + new Date().toISOString());
  console.log("=".repeat(60));

  const retiredCount = await retireStaleArticles();
  const existingUrls = await getExistingUrls();
  const { inserted, skipped } = await insertArticles(existingUrls);
  const activeCount = await getActiveAiCount();

  console.log("\n" + "=".repeat(60));
  console.log("📊 CURATION REPORT");
  console.log("=".repeat(60));
  console.log(`\n📤 Articles retired:    ${retiredCount}`);
  console.log(`\n✅ Articles inserted (${inserted.length}):`);
  for (const a of inserted) {
    console.log(`   • ${a.title}`);
    console.log(`     ${a.source_domain}`);
  }
  console.log(`\n⏭️  Articles skipped (${skipped.length}):`);
  for (const a of skipped) {
    console.log(`   • ${a.title} — ${a.reason}`);
  }
  console.log(`\n📈 Active AI articles:  ${activeCount}`);
  console.log("\n✨ Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
