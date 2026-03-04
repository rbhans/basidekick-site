import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const createSubmissionSchema = z.object({
  type: z.enum(["error", "edit", "new_entry"]),
  entry_id: z.string().nullable().optional(),
  brand_id: z.string().nullable().optional(),
  brand_name: z.string().nullable().optional(),
  brand_logo_url: z.string().nullable().optional(),
  type_id: z.string().nullable().optional(),
  type_name: z.string().nullable().optional(),
  model_name: z.string().nullable().optional(),
  model_numbers: z.array(z.string()).nullable().optional(),
  protocols: z.array(z.string()).nullable().optional(),
  model_status: z.enum(["current", "discontinued"]).nullable().optional(),
  description: z.string().nullable().optional(),
  manufacturer_url: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  suggested_changes: z.record(z.string(), z.unknown()).nullable().optional(),
});

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }

  return user;
}

// POST - Create submission
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const parseResult = createSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error.flatten());
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parseResult.data;

    const { data: submission, error: insertError } = await supabase
      .from("equipment_submissions")
      .insert({
        user_id: user.id,
        type: data.type,
        entry_id: data.entry_id || null,
        brand_id: data.brand_id || null,
        brand_name: data.brand_name || null,
        brand_logo_url: data.brand_logo_url || null,
        type_id: data.type_id || null,
        type_name: data.type_name || null,
        model_name: data.model_name || null,
        model_numbers: data.model_numbers || null,
        protocols: data.protocols || null,
        model_status: data.model_status || null,
        description: data.description || null,
        manufacturer_url: data.manufacturer_url || null,
        image_url: data.image_url || null,
        suggested_changes: data.suggested_changes || null,
        review_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      if (insertError.code === "P0001" || insertError.message?.toLowerCase().includes("rate limit")) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - List user's submissions
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data: submissions, error: fetchError } = await supabase
      .from("equipment_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
    }

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
