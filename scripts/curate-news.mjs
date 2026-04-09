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
// Curated April 9, 2026 — sources from April 7-9, 2026
const ARTICLES = [
  {
    title: "In Conversation with Rudolf Erasmus",
    url: "https://www.automatedbuildings.com/2026/04/in-conversation-with-rudolf-erasmus/",
    slug: "in-conversation-with-rudolf-erasmus-k2m8p5n3",
    source_domain: "automatedbuildings.com",
    summary:
      "Reliable Controls Hardware Manager Rudolf Erasmus discusses millimeter-wave occupancy detection and 10BASE-T1L single-pair Ethernet as an emerging field-device connectivity layer for BAS networks — a hardware perspective on the sensors and wiring choices shaping next-generation installations.",
    tags: ["controls", "iot", "bacnet", "smart-building"],
  },
  {
    title: "Allies, Not Angels — Choosing to Embrace AI on Your Own Terms",
    url: "https://www.automatedbuildings.com/2026/04/allies-not-angels-choosing-to-embrace-ai-on-your-own-terms/",
    slug: "allies-not-angels-choosing-to-embrace-ai-on-your-w7x3b9c5",
    source_domain: "automatedbuildings.com",
    summary:
      "Part of AutomatedBuildings.com's April 'AI Across the Stack' theme, this piece argues controls professionals should treat AI as a practical tool—not a mystical force—and deliberately define their own adoption criteria before vendors define it for them.",
    tags: ["ai", "smart-building", "controls"],
  },
  {
    title: "Convergence on AutomatedBuildings.com",
    url: "https://www.automatedbuildings.com/2026/04/history-convergence-on-automatedbuildings-com/",
    slug: "convergence-on-automatedbuildings-com-m4t7r2n6",
    source_domain: "automatedbuildings.com",
    summary:
      "Two decades of convergence coverage charted: how BAS shifted from 'Platform Wars' to 'Platform Peace' through open standards like Haystack and Brick Schema, creating the semantic layer AI now needs to meaningfully interpret building data.",
    tags: ["smart-building", "controls", "iot", "analytics"],
  },
  {
    title: "What 30 Years of Service Taught Tom Zaban About People",
    url: "https://www.reliablecontrols.com/news/article/tom-zaban-on-people-and-purpose/",
    slug: "what-30-years-of-service-taught-tom-zaban-about-d9k3m5p7",
    source_domain: "reliablecontrols.com",
    summary:
      "Reliable Controls President Tom Zaban reflects on three decades shaping the company's BAS product philosophy—simple, flexible, sustainable—and why investing in people and ongoing technical education is the defining challenge as building automation grows more complex.",
    tags: ["controls", "smart-building"],
  },
  {
    title: "Optigo Networks and Neeve Partner to Bring Next Generation BACnet Monitoring to the Neeve App Marketplace",
    url: "https://www.prweb.com/releases/optigo-networks-and-neeve-partner-to-bring-next-generation-bacnet-monitoring-to-the-neeve-app-marketplace-302736628.html",
    slug: "optigo-networks-and-neeve-partner-to-bring-next-r4k9j2m8",
    source_domain: "prweb.com",
    summary:
      "Optigo Networks' purpose-built BACnet packet-capture and diagnostics tool is now a one-click install on Neeve's OT network platform, giving integrators and IT teams clean, correctly parsed BACnet MS/TP and IP traffic data without manual setup.",
    tags: ["bacnet", "iot", "controls", "cybersecurity"],
  },
  {
    title: "House Panel Advances 5 Cybersecurity Bills Targeting Energy Infrastructure",
    url: "https://www.meritalk.com/articles/house-panel-advances-five-cybersecurity-bills-targeting-energy-infrastructure/",
    slug: "house-panel-advances-5-cybersecurity-bills-target-p5n2k8w3",
    source_domain: "meritalk.com",
    summary:
      "The U.S. House Energy and Commerce Committee advanced five bipartisan bills—including the Energy Threat Analysis Center Act and Pipeline Cybersecurity Preparedness Act—signaling growing federal regulatory pressure on OT security for energy-connected building systems.",
    tags: ["cybersecurity", "energy", "controls"],
  },
  {
    title: "CxEnergy 2026 Technical Program and Keynote Announced",
    url: "https://www.csemag.com/cxenergy-2026-technical-program-and-keynote-announced/",
    slug: "cxenergy-2026-technical-program-and-keynote-announ-x7b4r9v5",
    source_domain: "csemag.com",
    summary:
      "CxEnergy 2026 (April 21-24, Chicago) announces 30+ sessions and a keynote, 'From Checklists to Co-Pilots: Practical AI for Commissioning and Energy Professionals,' directly relevant for commissioning agents and energy managers navigating AI adoption.",
    tags: ["commissioning", "energy", "ai", "analytics"],
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
  console.log("🤖 BASidekick News Curator — April 9, 2026 — " + new Date().toISOString());
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
