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
// Curated April 10, 2026 — sources from April 7-10, 2026 (with select March items)
const ARTICLES = [
  {
    title: "The Building Revolution: Is AI About to Eat Your Smart Building Stack?",
    url: "https://www.automatedbuildings.com/2026/04/the-building-revolution-is-ai-about-to-eat-your-smart-building-stack/",
    slug: "the-building-revolution-is-ai-about-to-eat-your-sm-p4w9k3n7",
    source_domain: "automatedbuildings.com",
    summary:
      "AutomatedBuildings.com's April 'AI Across the Stack' series examines whether AI is making the 'Smarter Stack' framework obsolete, challenging controls professionals to reconsider how traditional integration layers between building owners, occupants, and operators actually function in an AI-augmented world.",
    tags: ["ai", "smart-building", "controls", "analytics"],
  },
  {
    title: "Shaping Intelligence: How Our Built Environment Must Guide AI Before It Guides Us",
    url: "https://www.automatedbuildings.com/2026/04/shaping-intelligence-how-our-built-environment-must-guide-ai-before-it-guides-us/",
    slug: "shaping-intelligence-how-our-built-environment-mus-q5t8r2x6",
    source_domain: "automatedbuildings.com",
    summary:
      "This piece argues that AI applied to buildings demands semantic data foundations first — most buildings today cannot explain their own systems — and calls on industry bodies including the Asset Leadership Network and Linux Foundation's Coalition for Smarter Buildings to standardize before AI value can be realized.",
    tags: ["ai", "smart-building", "iot", "analytics"],
  },
  {
    title: "Iran-Linked Hackers Target Water and Energy — FBI and CISA Warn",
    url: "https://www.cybersecuritydive.com/news/iran-linked-hackers-targeting-water-energy-in-us-fbi-and-cisa-warn/816949/",
    slug: "iran-linked-hackers-target-water-and-energy-fbi-an-n2t7v8m5",
    source_domain: "cybersecuritydive.com",
    summary:
      "CISA, FBI, and NSA jointly warned on April 7, 2026 that Iranian-affiliated actors are actively exploiting internet-facing PLCs at U.S. water, energy, and government facilities — a direct call for building operators to audit OT device internet exposure and review firmware on all field-connected equipment.",
    tags: ["cybersecurity", "controls", "energy"],
  },
  {
    title: "New MultiTech Niagara Driver Enables the Convergence of IoT and BMS for Smart Buildings",
    url: "https://www.prnewswire.com/news-releases/new-multitech-niagara-driver-enables-the-convergence-of-iot-and-bms-for-smart-buildings-302735940.html",
    slug: "new-multitech-niagara-driver-enables-convergence-o-k7r3n9t1",
    source_domain: "prnewswire.com",
    summary:
      "Unveiled at Niagara Summit 2026, MultiTech's new Niagara Framework driver brings drag-and-drop LoRaWAN sensor onboarding directly into the Niagara environment, letting integrators manage wireless field devices alongside traditional BAS points in a unified dashboard — available free on the Tridium Marketplace after the Summit.",
    tags: ["niagara", "tridium", "iot", "smart-building"],
  },
  {
    title: "Forescout 2026 Riskiest Connected Devices: BACnet Routers Among 11 New High-Risk Types",
    url: "https://www.forescout.com/press-releases/forescouts-2026-riskiest-connected-devices-report-highlights-11-new-device-types-as-network-infrastructure-surpasses-endpoints-in-overall-risk/",
    slug: "forescout-2026-riskiest-connected-devices-bacnet-r-k8t5v2c9",
    source_domain: "forescout.com",
    summary:
      "Forescout's 2026 annual risk report names BACnet routers, serial-to-IP converters, and RFID readers among 11 newly high-risk device categories, with network infrastructure now outranking endpoints as the highest-risk category — a direct warning for BAS integrators about OT gateway device exposure.",
    tags: ["cybersecurity", "bacnet", "iot", "controls"],
  },
  {
    title: "MITRE Caldera Releases HVACSim to Train OT Security Defenders Without Physical Hardware",
    url: "https://industrialcyber.co/ics-security-framework/mitre-caldera-releases-hvacsim-to-train-ot-security-defenders-without-physical-hardware/",
    slug: "mitre-caldera-releases-hvacsim-to-train-ot-securit-m7n3p9x2",
    source_domain: "industrialcyber.co",
    summary:
      "MITRE's Caldera team released HVACSim, an open-source BACnet-based HVAC controller simulator that integrates with Caldera for OT, enabling security defenders and students to practice BACnet adversary emulation — discovery, data collection, and process impact — without requiring access to physical building equipment.",
    tags: ["cybersecurity", "bacnet", "hvac", "controls"],
  },
  {
    title: "Siemens Showcases Journey from Smart to Autonomous Buildings at Light + Building 2026",
    url: "https://press.siemens.com/global/en/pressrelease/siemens-showcases-journey-smart-autonomous-buildings-light-building-2026",
    slug: "siemens-showcases-journey-from-smart-to-autonomous-x3p6r8w4",
    source_domain: "press.siemens.com",
    summary:
      "At Light + Building 2026 in Frankfurt, Siemens presented its roadmap for human-centric autonomous building technology including an updated LOGO! 9 logic module and AI-driven systems that dynamically adjust HVAC and other building functions — offering a vendor-level signal on where major BAS platforms are heading in the next product cycle.",
    tags: ["smart-building", "hvac", "ai", "controls"],
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
  console.log("🤖 BASidekick News Curator — April 10, 2026 — " + new Date().toISOString());
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
