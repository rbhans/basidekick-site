import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reviewer_notes: z.string().max(2000).optional(),
});

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function getAuthenticatedUser(request: Request): Promise<User | null> {
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const parseResult = actionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { action, reviewer_notes } = parseResult.data;
    const reviewer_id = user.id;

    const { data: reviewerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", reviewer_id)
      .single();

    if (profileError || reviewerProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { data: contribution, error: fetchError } = await supabase
      .from("wiki_contributions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
    }

    if (contribution.status !== "pending") {
      return NextResponse.json(
        { error: `Contribution already ${contribution.status}` },
        { status: 400 }
      );
    }

    // Atomically claim row
    const newStatus = action === "approve" ? "approved" : "rejected";
    const { data: claimed, error: claimError } = await supabase
      .from("wiki_contributions")
      .update({
        status: newStatus,
        reviewed_by: reviewer_id,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewer_notes || null,
      })
      .eq("id", id)
      .eq("status", "pending")
      .select("id")
      .single();

    if (claimError || !claimed) {
      return NextResponse.json(
        { error: "Contribution was already processed by another reviewer" },
        { status: 409 }
      );
    }

    let approved_article_id: string | null = null;

    if (action === "approve") {
      try {
        if (contribution.type === "new_entry") {
          // Pick a unique slug
          let slug = contribution.slug || slugify(contribution.title);
          if (!slug) slug = `entry-${Date.now()}`;

          // Ensure uniqueness — append -2, -3 … if collision
          let attempt = 0;
          let candidate = slug;
          // Cap loop at 50 attempts to avoid runaway
          while (attempt < 50) {
            const { data: existing } = await supabase
              .from("wiki_articles")
              .select("id")
              .eq("slug", candidate)
              .maybeSingle();
            if (!existing) {
              slug = candidate;
              break;
            }
            attempt += 1;
            candidate = `${slug}-${attempt + 1}`;
          }

          const { data: inserted, error: insertErr } = await supabase
            .from("wiki_articles")
            .insert({
              title: contribution.title,
              slug,
              summary: contribution.summary,
              content: contribution.content,
              category_id: contribution.category_id,
              author_id: contribution.user_id,
              is_published: false,
            })
            .select("id")
            .single();

          if (insertErr || !inserted) {
            console.error("Failed to insert approved article:", insertErr);
            // Revert claim so admin can retry
            await supabase
              .from("wiki_contributions")
              .update({
                status: "pending",
                reviewed_by: null,
                reviewed_at: null,
                reviewer_notes: null,
              })
              .eq("id", id);
            return NextResponse.json(
              { error: "Failed to create wiki article from contribution" },
              { status: 500 }
            );
          }
          approved_article_id = inserted.id;
        } else if (contribution.type === "edit" && contribution.target_article_id) {
          const { error: updateErr } = await supabase
            .from("wiki_articles")
            .update({
              title: contribution.title,
              summary: contribution.summary,
              content: contribution.content,
              category_id: contribution.category_id,
            })
            .eq("id", contribution.target_article_id);

          if (updateErr) {
            console.error("Failed to apply edit:", updateErr);
            await supabase
              .from("wiki_contributions")
              .update({
                status: "pending",
                reviewed_by: null,
                reviewed_at: null,
                reviewer_notes: null,
              })
              .eq("id", id);
            return NextResponse.json(
              { error: "Failed to apply edit to wiki article" },
              { status: 500 }
            );
          }
          approved_article_id = contribution.target_article_id;
        }

        if (approved_article_id) {
          await supabase
            .from("wiki_contributions")
            .update({ approved_article_id })
            .eq("id", id);
        }
      } catch (applyErr) {
        console.error("Approval apply failed:", applyErr);
        await supabase
          .from("wiki_contributions")
          .update({
            status: "pending",
            reviewed_by: null,
            reviewed_at: null,
            reviewer_notes: null,
          })
          .eq("id", id);
        return NextResponse.json(
          { error: "Failed to apply approval" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, action, approved_article_id });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const { data: contribution, error } = await supabase
      .from("wiki_contributions")
      .select(
        `*,
        submitter:profiles!wiki_contributions_user_id_fkey(display_name),
        reviewer:profiles!wiki_contributions_reviewed_by_fkey(display_name),
        target_article:wiki_articles!wiki_contributions_target_article_id_fkey(title, slug),
        category:wiki_categories!wiki_contributions_category_id_fkey(name, slug)`
      )
      .eq("id", id)
      .single();

    if (error || !contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isOwner = contribution.user_id === user.id;
    const isAdmin = userProfile?.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: You can only view your own contributions" },
        { status: 403 }
      );
    }

    return NextResponse.json({ contribution });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
