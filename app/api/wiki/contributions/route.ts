import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const createContributionSchema = z
  .object({
    type: z.enum(["edit", "new_entry"]),
    target_article_id: z.string().uuid().nullable().optional(),
    title: z.string().min(3, "Title is required").max(200, "Title too long"),
    slug: z
      .string()
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes only")
      .nullable()
      .optional(),
    summary: z.string().max(500).nullable().optional(),
    content: z.string().min(20, "Content too short").max(50000, "Content too long"),
    category_id: z.string().uuid().nullable().optional(),
    submitter_notes: z.string().max(2000).nullable().optional(),
  })
  .refine(
    (data) =>
      (data.type === "edit" && !!data.target_article_id) ||
      (data.type === "new_entry" && !data.target_article_id),
    { message: "edit requires target_article_id; new_entry must not have one" }
  );

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

    const { success: rateLimitOk } = await checkRateLimit(`wiki_contribution:${user.id}`);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before submitting again." },
        { status: 429 }
      );
    }

    const supabase = getServiceClient();
    if (!supabase) {
      console.error("Supabase not configured");
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const parseResult = createContributionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const data = parseResult.data;

    if (data.type === "edit" && data.target_article_id) {
      const { data: article, error: articleErr } = await supabase
        .from("wiki_articles")
        .select("id")
        .eq("id", data.target_article_id)
        .maybeSingle();
      if (articleErr || !article) {
        return NextResponse.json({ error: "Target article not found" }, { status: 404 });
      }
    }

    if (data.type === "new_entry" && data.slug) {
      const { data: existing } = await supabase
        .from("wiki_articles")
        .select("id")
        .eq("slug", data.slug)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: "Slug already in use. Pick a different one." },
          { status: 409 }
        );
      }
    }

    const { data: contribution, error: insertError } = await supabase
      .from("wiki_contributions")
      .insert({
        user_id: user.id,
        type: data.type,
        target_article_id: data.target_article_id ?? null,
        title: data.title,
        slug: data.slug ?? null,
        summary: data.summary ?? null,
        content: data.content,
        category_id: data.category_id ?? null,
        submitter_notes: data.submitter_notes ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      if (insertError.code === "P0001" || insertError.message?.toLowerCase().includes("rate limit")) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
      return NextResponse.json({ error: "Failed to create contribution" }, { status: 500 });
    }

    return NextResponse.json({ success: true, contribution });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const { data: contributions, error } = await supabase
      .from("wiki_contributions")
      .select(
        `*,
        target_article:wiki_articles!wiki_contributions_target_article_id_fkey(title, slug),
        category:wiki_categories!wiki_contributions_category_id_fkey(name, slug)`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
    }

    return NextResponse.json({ contributions });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
