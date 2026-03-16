import { NextResponse } from "next/server";
import { getBabelData } from "@/lib/data/babel";

export async function GET() {
  const data = await getBabelData();
  if (!data) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
  return NextResponse.json(data);
}
