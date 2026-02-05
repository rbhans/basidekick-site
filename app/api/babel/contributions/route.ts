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

// Helper to get service role Supabase client (for database operations)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Helper to verify JWT and get authenticated user
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

  // Create a client with the user's JWT to verify it
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

// POST - Create new contribution
export async function POST(request: Request) {
  try {
    // Verify JWT and get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
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

    // Insert contribution using authenticated user's ID from JWT
    const { data: contribution, error: insertError } = await supabase
      .from("babel_contributions")
      .insert({
        user_id: user.id, // Use verified user ID from JWT, not from request body
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
      if (insertError.code === "P0001" || insertError.message?.toLowerCase().includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
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
    // Verify JWT and get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    if (!supabase) {
      console.error("Supabase not configured");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    // Fetch contributions for the authenticated user only
    const { data: contributions, error: fetchError } = await supabase
      .from("babel_contributions")
      .select("*")
      .eq("user_id", user.id) // Use verified user ID from JWT
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
