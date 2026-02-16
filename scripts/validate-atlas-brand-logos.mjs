import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const atlasDataPath = path.join(rootDir, "public", "data", "atlas", "index.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

let atlasData;
try {
  atlasData = JSON.parse(readFileSync(atlasDataPath, "utf8"));
} catch (error) {
  fail(`Failed to read Atlas data from ${atlasDataPath}: ${error instanceof Error ? error.message : String(error)}`);
}

if (!Array.isArray(atlasData.brands)) {
  fail("Atlas data validation failed: expected `brands` to be an array.");
}

const errors = [];

for (const brand of atlasData.brands) {
  const id = typeof brand.id === "string" ? brand.id : "(unknown-id)";
  const logoUrl = typeof brand.logo_url === "string" ? brand.logo_url.trim() : "";

  if (!logoUrl) {
    errors.push(`${id}: missing logo_url`);
    continue;
  }

  if (logoUrl.startsWith("/")) {
    const localPath = path.join(rootDir, "public", logoUrl.replace(/^\/+/, ""));
    if (!existsSync(localPath)) {
      errors.push(`${id}: local logo file not found at ${logoUrl}`);
    }
    continue;
  }

  try {
    const parsed = new URL(logoUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      errors.push(`${id}: logo_url must use http(s) or a local /images/... path`);
    }
  } catch {
    errors.push(`${id}: invalid logo_url "${logoUrl}"`);
  }
}

if (errors.length > 0) {
  console.error("Atlas brand logo validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${atlasData.brands.length} Atlas brand logos.`);
