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
// Curated April 4, 2026 — sources from April 1–4, 2026
const ARTICLES = [
  {
    title: "Convergence on AutomatedBuildings.com — A History",
    url: "https://www.automatedbuildings.com/2026/04/history-convergence-on-automatedbuildings-com/",
    slug: "convergence-on-automatedbuildings-com-a-history-x2k9p4r1",
    source_domain: "automatedbuildings.com",
    summary:
      "AutomatedBuildings.com traces the arc from \"platform wars\" to \"platform peace\" — how open standards like Project Haystack and Brick Schema are converging BAS ecosystems into a shared semantic language that AI agents can act on without manual data mapping. A useful historical lens for integrators navigating multi-vendor environments and data normalization today.",
    tags: ["smart-building", "analytics", "iot", "ai", "controls"],
  },
  {
    title: "Honeywell Expands Security Portfolio in Bid to Catch AI Wave",
    url: "https://www.facilitiesdive.com/news/honeywell-expands-security-portfolio-in-bid-to-catch-ai-wave/815980/",
    slug: "honeywell-expands-security-portfolio-ai-wave-f6n3t7w2",
    source_domain: "facilitiesdive.com",
    summary:
      "Honeywell is partnering with Rhombus to deliver AI-powered cloud video surveillance and access control through its existing system integrator channels, with Rhombus AI analytics being integrated directly into Honeywell's access control platforms. For BAS integrators, this signals that physical security and building controls convergence is accelerating — and that Honeywell is positioning as a unified cloud-managed building platform.",
    tags: ["smart-building", "cybersecurity", "ai", "controls"],
  },
  {
    title: "Siemens Takes Steps to Integrate IAQ Sensing and Response into Building Controls",
    url: "https://www.facilitiesdive.com/news/siemens-takes-steps-to-integrate-iaq-sensing-and-response-into-building-con/815548/",
    slug: "siemens-iaq-sensing-response-building-controls-b8v5q2m9",
    source_domain: "facilitiesdive.com",
    summary:
      "Siemens is advancing its ARPA-H BREATHE program work, integrating indoor air biosensors into building automation software that automatically adjusts ventilation and filtration when sensors detect respiratory risk — with a $40M Mayo Clinic deployment spanning three campuses as the flagship project. Controls engineers should expect IAQ-driven setpoint overrides to become a standard BAS feature requirement in healthcare and high-occupancy facilities.",
    tags: ["hvac", "iot", "controls", "smart-building", "analytics"],
  },
  {
    title: "Johnson Controls' Metasys Update Designed for Greater Device Security, Easier System Management",
    url: "https://www.facilitiesdive.com/news/johnson-controls-metasys-update-designed-for-greater-device-security-easi/805920/",
    slug: "jci-metasys-update-device-security-management-c4h7n1f5",
    source_domain: "facilitiesdive.com",
    summary:
      "Metasys 15.0 raises the ceiling for open BAS scalability — supporting up to 1,000 IP devices per server (60% more than most competitors) and reducing device setup time by ~95% via a new web client, while adding BACnet/SC encrypted communication and single sign-on for IT-managed access control. Mission-critical sites like hospitals and data centers benefit most from the new multi-server redundancy that simultaneously backs up alerts, trends, and audit logs.",
    tags: ["bacnet", "controls", "cybersecurity", "smart-building", "ddc"],
  },
  {
    title: "Getting the Most from ASHRAE 36 HVAC Control Sequences",
    url: "https://www.facilitiesdive.com/news/getting-the-most-from-ashrae-36-hvac-control-sequences/806438/",
    slug: "getting-most-from-ashrae-36-hvac-control-sequence-w3j6p8s4",
    source_domain: "facilitiesdive.com",
    summary:
      "Facilities Dive examines practical implementation of ASHRAE Guideline 36 High Performance Sequences, noting field deployments show up to 45% HVAC energy reduction compared to baseline — but only when commissioning is done right and sequences are kept current. A timely read as California and Boston building codes begin requiring Guideline 36 adoption and the CxEnergy 2026 program dedicates sessions to G36 field lessons.",
    tags: ["hvac", "ashrae", "controls", "energy", "commissioning"],
  },
  {
    title: "NFMT East 2026: How Building Operations Help Organizations' Strategic Goals",
    url: "https://www.facilitiesdive.com/news/nfmt-east-2026-how-building-operations-help-organizations-strategic-goals/814435/",
    slug: "nfmt-east-2026-building-operations-strategic-goal-r7d2k5n8",
    source_domain: "facilitiesdive.com",
    summary:
      "Coverage from NFMT East 2026 highlights how facilities leaders are reframing BAS and building operations as a direct contributor to organizational strategy — connecting energy data, occupancy analytics, and maintenance workflows to C-suite metrics like carbon commitments and workforce productivity. Relevant for controls integrators making the case for BAS investment beyond utility savings.",
    tags: ["smart-building", "energy", "analytics", "sustainability", "controls"],
  },
  {
    title: "Siemens Advances Indoor Air Quality Innovation Through ARPA-H BREATHE Projects",
    url: "https://news.siemens.com/en-us/siemens-advances-arpa-h-breathe-projects/",
    slug: "siemens-advances-arpa-h-breathe-indoor-air-quality-m1t9v3q6",
    source_domain: "news.siemens.com",
    summary:
      "Siemens announced on March 24 its role across two ARPA-H BREATHE projects — integrating biosensors, AI risk assessment, and real-time BMS responses (ventilation, filtration, UV disinfection) to reduce respiratory disease transmission in hospitals and defense facilities. This is a direct signal that health-driven automated ventilation overrides will increasingly be written into BAS specifications for healthcare and government buildings.",
    tags: ["hvac", "iot", "controls", "analytics", "smart-building"],
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
  console.log("🤖 BASidekick News Curator — April 4, 2026 — " + new Date().toISOString());
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
