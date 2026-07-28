import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const port = 4100 + (process.pid % 1000);
const origin = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  const output = [];
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => output.push(chunk.toString()));
  server.stderr.on("data", (chunk) => output.push(chunk.toString()));

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before tests started.\n${output.join("")}`);
    }
    try {
      const response = await fetch(origin, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Next.js did not become ready.\n${output.join("")}`);
});

after(() => {
  server?.kill("SIGTERM");
});

async function request(path = "/", accept = "text/html") {
  return fetch(`${origin}${path}`, {
    headers: { accept },
    redirect: "manual",
  });
}

test("server-renders the public BASidekick landing page", async () => {
  const response = await request();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /BASidekick/);
  assert.match(html, /The BAS/);
  assert.match(html, /workspace\./);
  assert.match(html, /Open workspace/);
  assert.match(html, /PointStack Social/);
  assert.match(html, /returning soon/i);
  assert.match(html, /class="hero-art"/);
  assert.match(html, /class="feature-art"/);
  assert.match(html, /data-art="wiki"/);
  assert.match(html, /data-art="pointstack"/);
  assert.match(html, /data-art="tools"/);
  assert.match(html, /class="brandmark"/);
  assert.match(html, /class="brandmark-source"/);
  assert.match(html, /class="brandmark-arrow"/);
  assert.match(html, /class="brandmark-target"/);
  assert.match(html, /x="3\.25" y="6\.2" width="5\.6" height="5\.6" rx="0\.9"/);
  assert.match(html, /M10\.1 9 H16\.7 M14\.45 6\.8 L16\.75 9 L14\.45 11\.2/);
  assert.match(html, /x="19\.8" y="2\.75" width="9\.2" height="12\.5" rx="1\.3"/);
  assert.doesNotMatch(html, /_next\/image\?url=%2Fbrand%2F(?:hero-control-path|control-loop-art)/);
});

test("keeps Optical Balance geometry aligned across canonical brand assets", async () => {
  const assetNames = [
    "avatar-dark.svg",
    "avatar-light.svg",
    "brandmark-inverse.svg",
    "brandmark-maskable.svg",
    "brandmark-mono.svg",
    "brandmark.svg",
    "favicon.svg",
    "social-square.svg",
    "social-twitter-header.svg",
    "wordmark-dark.svg",
    "wordmark-light.svg",
    "wordmark-mono.svg",
  ];

  for (const assetName of assetNames) {
    const asset = await readFile(
      new URL(`../public/brand/${assetName}`, import.meta.url),
      "utf8",
    );
    assert.match(asset, /x="3\.25" y="6\.2" width="5\.6" height="5\.6" rx="0\.9"/);
    assert.match(asset, /M10\.1 9 H16\.7 M14\.45 6\.8 L16\.75 9 L14\.45 11\.2/);
    assert.match(asset, /x="19\.8" y="2\.75" width="9\.2" height="12\.5" rx="1\.3"/);
  }
});

test("reports Atlas rebuild status without advertising retired endpoints", async () => {
  const response = await request("/api/atlas", "application/json");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  const body = await response.json();
  assert.equal(body.name, "BASidekick Atlas");
  assert.equal(body.status, "rebuilding");
  assert.match(body.description, /different data model and interface/i);
  assert.equal(body.endpoints, undefined);
  assert.equal(body.data, undefined);
});

test("publishes an LLM-readable workspace index", async () => {
  const response = await request("/llms.txt", "text/plain");
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.match(text, /^# BASidekick/m);
  assert.match(text, /\/library/);
  assert.match(text, /\/references/);
});

test("keeps one global search entry on the Tools overview", async () => {
  const response = await request("/tools");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.equal((html.match(/class="topbar-search"/g) ?? []).length, 1);
  assert.match(html, /class="animated-nav-icon"/);
  assert.doesNotMatch(html, /workspace-load-signal/);
  assert.doesNotMatch(html, /brandmark-intro/);
  assert.doesNotMatch(html, /class="search-trigger"/);
  assert.doesNotMatch(html, /Search tools/);
});

test("keeps the selected UI and motion improvement contracts", async () => {
  const [
    css,
    shell,
    workspaceCommand,
    hotspot,
    ahuHotspot,
    componentConfig,
    accountActivity,
  ] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../components/app-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/workspace-command.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/learn/assessment/hotspot.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/learn/illustrations/intro-to-bas/ahu-find-the-spot.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components.json", import.meta.url), "utf8"),
    readFile(new URL("../components/account-activity.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(css, /--radius-lg:\s*9px/);
  assert.match(css, /\.button:active:not\(:disabled\)\s*\{\s*transform:\s*scale\(\.97\)/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /\.landing-feature-grid a:hover \.feature-art::before\s*\{\s*transform:\s*scale\(1\.018\)/);
  assert.doesNotMatch(shell, /trapPaletteFocus|AnimatePresence|motion\.(?:div|section)/);
  assert.match(workspaceCommand, /from "@\/components\/primitives\/command"/);
  assert.match(workspaceCommand, /from "@\/components\/primitives\/dialog"/);
  assert.doesNotMatch(hotspot, /initial=\{\{ scale: 0,/);
  assert.doesNotMatch(ahuHotspot, /initial=\{\{ scale: 0,/);
  assert.match(componentConfig, /"ui": "@\/components\/primitives"/);
  assert.match(accountActivity, /TEMPORARILY UNAVAILABLE/);
  assert.match(accountActivity, /Notifications could not be loaded/);
  assert.match(accountActivity, /Messages could not be loaded/);
});

test("keeps Industry signal on the shared dashboard panel treatment", async () => {
  const response = await request("/dashboard");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Industry signal/);
  assert.match(html, /class="panel span-2"/);
  assert.doesNotMatch(html, /signal-panel/);
});

test("renders one theme toggle in the workspace shell", async () => {
  const response = await request("/dashboard");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.equal(
    (html.match(/aria-label="Use (?:light|dark) theme"/g) ?? []).length,
    1,
  );
});

test("presents Intro to BAS as one course with ten connected lessons", async () => {
  const coursesResponse = await request("/courses");
  assert.equal(coursesResponse.status, 200);
  const coursesHtml = await coursesResponse.text();
  assert.equal((coursesHtml.match(/class="course-feature"/g) ?? []).length, 1);
  assert.match(coursesHtml, /One complete starting course/);
  assert.match(coursesHtml, /Intro to BAS/);
  assert.match(coursesHtml, /10(?:<!-- -->)? lessons/);
  assert.doesNotMatch(coursesHtml, /10 courses/i);

  const courseResponse = await request("/courses/intro-to-bas");
  assert.equal(courseResponse.status, 200);
  const courseHtml = await courseResponse.text();
  const lessonLinks = courseHtml.match(/href="\/courses\/intro-to-bas\/[^"]+"/g) ?? [];
  assert.equal(new Set(lessonLinks).size, 10);
  assert.match(courseHtml, /What is a Building Automation System\?/);
  assert.match(courseHtml, /What Comes Next/);
});

test("server-renders the original course diagrams and interaction types", async () => {
  const wakeUpResponse = await request("/courses/intro-to-bas/04-watching-a-building-wake-up");
  assert.equal(wakeUpResponse.status, 200);
  const wakeUpHtml = await wakeUpResponse.text();
  assert.match(wakeUpHtml, /Watching a Building Wake Up/);
  assert.match(wakeUpHtml, /type="range"/);
  assert.match(wakeUpHtml, /aria-label="Next frame"/);
  assert.match(wakeUpHtml, /Control loop perspectives/);
  assert.match(wakeUpHtml, /Reveal definition/);

  const playersResponse = await request("/courses/intro-to-bas/05-the-major-players");
  assert.equal(playersResponse.status, 200);
  const playersHtml = await playersResponse.text();
  assert.match(playersHtml, /The sequence of operations document/);
  assert.match(playersHtml, /Check order/);
  assert.match(playersHtml, /Check matches/);
  assert.match(playersHtml, /Label the diagram/);

  const lifecycleResponse = await request("/courses/intro-to-bas/09-the-project-lifecycle");
  assert.equal(lifecycleResponse.status, 200);
  const lifecycleHtml = await lifecycleResponse.text();
  assert.match(lifecycleHtml, /project-phase-ribbon/);
  assert.match(lifecycleHtml, /Seven phases of a BAS project/);
  assert.doesNotMatch(lifecycleHtml, /\/diagrams\/project-phases\.svg/);
});

test("keeps contribution and account routes protected with return paths", async () => {
  const routes = [
    ["/account", "/signin?redirect=/account"],
    ["/admin", "/signin?redirect=/admin"],
    ["/pointstack/messages", "/signin?redirect=/pointstack/messages"],
    ["/pointstack/notifications", "/signin?redirect=/pointstack/notifications"],
    ["/pointstack/new", "/signin?redirect=/pointstack/new"],
    ["/pointstack/jobs/new", "/signin?redirect=/pointstack/jobs/new"],
    ["/wiki/contribute", "/signin?redirect=/wiki/contribute"],
  ];
  for (const [path, destination] of routes) {
    const response = await request(path);
    assert.equal(response.status, 307);
    const location = new URL(response.headers.get("location"), origin);
    assert.equal(location.pathname + location.search, destination);
  }
});

test("server-renders direct account creation and recovery routes", async () => {
  const routes = [
    ["/signup", /Join the workspace/],
    ["/forgot-password", /Reset your password/],
    ["/reset-password", /Choose a new password/],
  ];
  for (const [path, pattern] of routes) {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), pattern);
  }
});

test("redirects retained legacy routes without inventing Atlas compatibility", async () => {
  const routes = [
    ["/open-source", "/library"],
    ["/pointstack/resources", "/library"],
    ["/experts/example", "/pointstack/people"],
    ["/resources/rust", "/library"],
    ["/resources/babel/example", "/atlas"],
    ["/wiki/videos", "/wiki"],
    ["/wiki/tags/bacnet", "/wiki"],
  ];
  for (const [path, destination] of routes) {
    const response = await request(path);
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, destination);
  }
});

test("exposes one cross-workspace search endpoint", async () => {
  const response = await request("/api/search?q=BACnet", "application/json");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.items));
});
