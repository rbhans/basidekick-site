import { NextResponse } from "next/server";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
};

const index = {
  name: "BASidekick Atlas",
  status: "rebuilding",
  description: "Atlas is being redesigned with a different data model and interface. No compatibility promise is being made for the retired API.",
  updates: "https://basidekick.com/atlas",
};

export function GET() {
  return NextResponse.json(index, { headers });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}
