import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFeedArticles,
  canonicalizeUrl,
  extractPrimaryUrl,
  parseFeedItems,
} from "./curate-news.mjs";

test("parseFeedItems extracts RSS items", () => {
  const xml = `<?xml version="1.0"?>
    <rss version="2.0">
      <channel>
        <item>
          <title><![CDATA[Building automation continues to overperform]]></title>
          <link>https://www.facilitiesdive.com/news/building-automation-continues-to-overperform/818498/?utm_source=rss</link>
          <description><![CDATA[<p>Sales in the segment increased 8%.</p>]]></description>
          <pubDate>Mon, 27 Apr 2026 09:16:53 -0400</pubDate>
        </item>
        <item>
          <title>Office portfolio buys suburban tower</title>
          <link>https://example.com/office-tower</link>
          <description>Not relevant</description>
          <pubDate>Mon, 27 Apr 2026 09:16:53 -0400</pubDate>
        </item>
      </channel>
    </rss>`;

  const items = parseFeedItems(xml);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, "Building automation continues to overperform");
  assert.equal(items[0].link, "https://www.facilitiesdive.com/news/building-automation-continues-to-overperform/818498/?utm_source=rss");
});

test("buildFeedArticles filters, tags, and deduplicates relevant items", () => {
  const feed = {
    name: "Facilities Dive",
    strategy: "keyword",
    defaultTags: ["energy", "hvac"],
  };

  const items = [
    {
      title: "Building automation continues to overperform, Honeywell says",
      link: "https://www.facilitiesdive.com/news/building-automation-continues-to-overperform/818498/?utm_source=rss",
      description: "<p>Sales in the segment increased 8% while the company highlighted controls demand.</p>",
      pubDate: "Mon, 27 Apr 2026 09:16:53 -0400",
    },
    {
      title: "Office landlord announces tenant amenity refresh",
      link: "https://example.com/tenant-amenity-refresh",
      description: "<p>Pure real-estate operations item with no automation tie-in.</p>",
      pubDate: "Mon, 27 Apr 2026 09:16:53 -0400",
    },
    {
      title: "Building automation continues to overperform, Honeywell says",
      link: "https://www.facilitiesdive.com/news/building-automation-continues-to-overperform/818498/?utm_source=newsletter",
      description: "<p>Duplicate URL after canonicalization.</p>",
      pubDate: "Mon, 27 Apr 2026 09:16:53 -0400",
    },
  ];

  const articles = buildFeedArticles(feed, items, {
    lookbackDays: 7,
    limit: 10,
    now: new Date("2026-04-28T00:00:00.000Z"),
  });

  assert.equal(articles.length, 1);
  assert.equal(
    articles[0].url,
    "https://www.facilitiesdive.com/news/building-automation-continues-to-overperform/818498"
  );
  assert.deepEqual(articles[0].tags, ["energy", "hvac", "controls", "smart-building"]);
  assert.match(articles[0].slug, /^building-automation-continues-to-overperform-hone/);
});

test("extractPrimaryUrl unwraps search redirects and canonicalizeUrl strips junk params", () => {
  const redirected =
    "https://www.bing.com/news/apiclick.aspx?ref=FexRss&url=https%3A%2F%2Fexample.com%2Fstory%2Fabc%3Futm_source%3Drss%26gclid%3D123";

  assert.equal(extractPrimaryUrl(redirected), "https://example.com/story/abc");
  assert.equal(
    canonicalizeUrl("https://example.com/story/abc/?utm_medium=email&fbclid=123"),
    "https://example.com/story/abc"
  );
});
