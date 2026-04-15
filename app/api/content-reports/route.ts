import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const createReportSchema = z.object({
  target_type: z.enum([
    "atlas_point",
    "atlas_equipment",
    "wiki_article",
    "new_atlas_entry",
  ]),
  target_id: z.string().nullable().optional(),
  target_label: z.string().max(300).nullable().optional(),
  target_url: z.string().max(500).nullable().optional(),
  message: z.string().min(1, "Message is required").max(5000, "Message too long"),
});

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: rateLimitOk } = await checkRateLimit(`content-report:${user.id}`);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before submitting again." },
        { status: 429 }
      );
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const parseResult = createReportSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parseResult.data;

    if (data.target_type !== "new_atlas_entry" && !data.target_id) {
      return NextResponse.json(
        { error: "target_id is required for this report type" },
        { status: 400 }
      );
    }

    const { data: report, error: insertError } = await supabase
      .from("content_reports")
      .insert({
        user_id: user.id,
        target_type: data.target_type,
        target_id: data.target_id || null,
        target_label: data.target_label || null,
        target_url: data.target_url || null,
        message: data.message,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("content_reports insert error:", insertError);
      return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
    }

    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error("content-reports POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
