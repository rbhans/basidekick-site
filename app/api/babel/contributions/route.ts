import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Validation schema for creating a contribution
const createContributionSchema = z.object({
  type: z.enum(["error", "edit", "new_entry"]),
  entry_id: z.string().nullable().optional(),
  entry_type: z.enum(["point", "equipment"]).nullable().optional(),
  entry_category: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(5000, "Description too long"),
  suggested_changes: z.record(z.string(), z.unknown()).nullable().optional(),
});

// Helper to get authenticated Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST - Create new contribution
export async function POST(request: Request) {
  try {
    // Get authorization header for user identification
    const authHeader = request.headers.get("authorization");

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Supabase not configured");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const parseResult = createContributionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Validate that entry_id is provided for error/edit types
    if ((data.type === "error" || data.type === "edit") && !data.entry_id) {
      return NextResponse.json(
        { error: "Entry ID is required for error reports and edit suggestions" },
        { status: 400 }
      );
    }

    // Get user from the request (this requires the user_id to be passed in the body)
    // In a real implementation, you'd verify the JWT token
    if (!body.user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Insert contribution
    const { data: contribution, error: insertError } = await supabase
      .from("babel_contributions")
      .insert({
        user_id: body.user_id,
        type: data.type,
        entry_id: data.entry_id || null,
        entry_type: data.entry_type || null,
        entry_category: data.entry_category || null,
        title: data.title,
        description: data.description,
        suggested_changes: data.suggested_changes || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create contribution" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, contribution });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List user's contributions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Supabase not configured");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const { data: contributions, error: fetchError } = await supabase
      .from("babel_contributions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch contributions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contributions });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
