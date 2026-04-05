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
// Curated April 5, 2026 — sources from late March – early April 2026
const ARTICLES = [
  {
    title: "Iran Conflict Highlights Cyberthreat Exposure of U.S. Facilities",
    url: "https://www.facilitiesdive.com/news/iran-conflict-highlights-cyberthreat-exposure-of-us-facilities/816215/",
    slug: "iran-conflict-highlights-cyberthreat-us-facilitie-m4k2p8r7",
    source_domain: "facilitiesdive.com",
    summary:
      "State-backed threat actors linked to the Iran conflict are actively targeting unsecured BMS and OT systems in commercial real estate, critical facilities, and data centers — with a single phishing click documented as triggering a 90-day BMS recovery and full occupier relocation. Facility managers are urged to audit internet-exposed building systems and segment OT networks immediately.",
    tags: ["cybersecurity", "smart-building", "iot", "controls"],
  },
  {
    title: "Threat Groups Target Cyber-Physical Systems to Disrupt Critical Infrastructure Providers",
    url: "https://www.facilitiesdive.com/news/threat-groups-target-cyber-physical-systems-to-disrupt-critical-infrastruct/815125/",
    slug: "threat-groups-cyber-physical-critical-infrastruct-b9n3v5q1",
    source_domain: "facilitiesdive.com",
    summary:
      "Hacktivists and state-sponsored actors are exploiting OT vulnerabilities in building access control, HVAC, lighting, and metering systems with the goal of causing physical disruption to critical infrastructure operators. Controls integrators are being called to treat BAS network segmentation and device-level authentication as non-negotiable baseline posture, not optional hardening.",
    tags: ["cybersecurity", "iot", "controls", "smart-building"],
  },
  {
    title: "Legacy BMS Protocol Poses Threat to Building Systems: Claroty",
    url: "https://www.facilitiesdive.com/news/legacy-bms-protocol-poses-threat-to-building-systems-claroty/812827/",
    slug: "legacy-bms-lontalk-protocol-poses-threat-claroty-x7h2w4j6",
    source_domain: "facilitiesdive.com",
    summary:
      "Claroty's Team82 found the 1990s-era LonTalk protocol still running \"under the covers\" of proprietary BMS implementations across commercial real estate, hospitality, and data centers — with many exposed controllers providing weak or no authentication. This hidden attack surface persists even when integrators believe a building has fully migrated to BACnet or modern IP-based protocols.",
    tags: ["cybersecurity", "bacnet", "controls", "smart-building"],
  },
  {
    title: "Schneider Electric Debuts Unified AI-Powered Platform for Buildings",
    url: "https://www.facilitiesdive.com/news/schneider-electric-debuts-unified-ai-powered-platform-for-buildings/806535/",
    slug: "schneider-ecostruxure-foresight-ai-platform-build-t3f8c1n5",
    source_domain: "facilitiesdive.com",
    summary:
      "Schneider Electric's EcoStruxure Foresight Operation unifies energy, electrical distribution, and building systems into a single AI-driven supervisory platform, targeting up to 50% operational efficiency gains and 40% reduction in engineering workload — with beta access planned for Q3 2026. For integrators, the platform directly addresses the long-standing fragmentation between BAS, power management, and utility data that drives up operational complexity.",
    tags: ["ai", "energy", "controls", "smart-building", "analytics"],
  },
  {
    title: "Five Global Trends Reshaping Building Automation",
    url: "https://www.johnsoncontrols.com/building-insights/2026/thought-leadership/five-global-trends-reshaping-building-automation",
    slug: "five-global-trends-reshaping-building-automation-k6m2s9r4",
    source_domain: "johnsoncontrols.com",
    summary:
      "Johnson Controls identifies five forces accelerating BAS transformation in 2026: energy cost pressure, tightening decarbonization regulations, aging infrastructure, workforce shortages, and the shift to AI-integrated platforms that connect HVAC, lighting, security, and fire systems. A practical reference for integrators building the business case for BAS modernization and LEED v5 compliance pathways.",
    tags: ["smart-building", "energy", "controls", "ai", "sustainability"],
  },
  {
    title: "California's 2025 Title 24 Code: The 5 Biggest Changes Impacting Construction in 2026 and Beyond",
    url: "https://www.milrose.com/insights/californias-2025-title-24-code-the-5-biggest-changes-impacting-construction-in-2026-and-beyond",
    slug: "california-title-24-2025-biggest-changes-2026-p4v7n1q8",
    source_domain: "milrose.com",
    summary:
      "California's 2025 Title 24 energy code, in force as of January 1, 2026, mandates ASHRAE Guideline 36 control sequences for VAV systems, requires automatic fault detection and diagnostics (AFDD) for covered HVAC equipment, and tightens DDC controller commissioning documentation requirements. The code is locked in through at least 2031 under AB 130, giving specifying engineers a stable compliance target for multi-year project pipelines.",
    tags: ["energy", "ashrae", "controls", "commissioning", "hvac"],
  },
  {
    title: "Cimetrics Releases BACstac 7.11 with Enhanced BACnet/SC and Revision 28 Support",
    url: "https://cimetrics.com/march-2026-company-news/",
    slug: "cimetrics-bacstac-711-bacnet-sc-revision-28-w2j5h8k3",
    source_domain: "cimetrics.com",
    summary:
      "Cimetrics released BACstac 7.11 in March 2026, delivering enhanced BACnet/SC (Secure Connect) encrypted communications, alignment with Revision 28 including Addenda 2020ci, 2020cf, and 2020co, and streamlined BTL certification support across Windows, Linux, and embedded targets. For OEMs and device manufacturers, this update simplifies the path to shipping BACnet/SC-capable products ahead of growing specification requirements for encrypted BAS communications.",
    tags: ["bacnet", "controls", "cybersecurity"],
  },
  {
    title: "Energy Savings to Push Electrification Forward in 2026 Despite Federal Headwinds",
    url: "https://www.facilitiesdive.com/news/energy-savings-to-push-electrification-forward-in-2026-despite-federal-headwinds/810541/",
    slug: "energy-savings-electrification-forward-2026-federa-r9d4t7m1",
    source_domain: "facilitiesdive.com",
    summary:
      "Despite rollbacks in federal clean energy incentives, commercial building electrification momentum continues in 2026 — driven by heat pump efficiency gains, falling equipment costs, and state mandates requiring all-electric new construction in California, Massachusetts, and New York. BAS integrators should prepare for growing demand for heat pump control sequences, grid-interactive building strategies, and load-flexibility programming tied to utility demand response programs.",
    tags: ["energy", "hvac", "sustainability", "retrofit", "controls"],
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
  console.log("🤖 BASidekick News Curator — April 5, 2026 — " + new Date().toISOString());
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
