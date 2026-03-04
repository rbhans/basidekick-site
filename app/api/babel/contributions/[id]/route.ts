import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import { Octokit } from "octokit";
import { z } from "zod";

// Validation schema for action requests (reviewer_id is now derived from JWT)
const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reviewer_notes: z.string().optional(),
});

// Helper to get service role Supabase client
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Helper to verify JWT and get authenticated user
async function getAuthenticatedUser(request: Request): Promise<User | null> {
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

// Helper to create GitHub issue
async function createGitHubIssue(contribution: {
  id: string;
  type: string;
  entry_id: string | null;
  entry_type: string | null;
  entry_category: string | null;
  title: string;
  description: string;
  suggested_changes: Record<string, unknown> | null;
  submitter_email?: string;
  submitter_name?: string;
}) {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error("GitHub token not configured");
  }

  const octokit = new Octokit({ auth: githubToken });

  // Format the issue type label
  const typeLabel = {
    error: "Error Report",
    edit: "Edit Suggestion",
    new_entry: "New Entry Request",
  }[contribution.type] || contribution.type;

  // Build the issue body
  let body = `## Contribution Type: ${typeLabel}\n\n`;

  if (contribution.entry_id) {
    body += `**Entry:** \`${contribution.entry_id}\``;
    if (contribution.entry_type) {
      body += ` (${contribution.entry_type}`;
      if (contribution.entry_category) {
        body += ` in ${contribution.entry_category}`;
      }
      body += `)`;
    }
    body += `\n`;
  }

  if (contribution.submitter_name || contribution.submitter_email) {
    body += `**Submitted by:** ${contribution.submitter_name || "Anonymous"}`;
    if (contribution.submitter_email) {
      body += ` (${contribution.submitter_email})`;
    }
    body += `\n`;
  }

  body += `\n### Description\n${contribution.description}\n`;

  if (contribution.suggested_changes && Object.keys(contribution.suggested_changes).length > 0) {
    body += `\n### Suggested Changes\n\`\`\`json\n${JSON.stringify(contribution.suggested_changes, null, 2)}\n\`\`\`\n`;
  }

  body += `\n---\n*Submitted via BASidekick contribution system*\n`;
  body += `*Contribution ID: ${contribution.id}*`;

  // Determine labels based on type
  const labels = ["contribution"];
  if (contribution.type === "error") {
    labels.push("bug");
  } else if (contribution.type === "edit") {
    labels.push("enhancement");
  } else if (contribution.type === "new_entry") {
    labels.push("new-entry");
  }

  // Create the issue
  const response = await octokit.rest.issues.create({
    owner: "rbhans",
    repo: "bas-babel",
    title: contribution.title,
    body,
    labels,
  });

  return response.data.html_url;
}

// POST - Approve or reject a contribution
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Parse and validate request body
    const body = await request.json();
    const parseResult = actionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { action, reviewer_notes } = parseResult.data;

    // Derive reviewer_id from verified JWT, not from request body
    const reviewer_id = user.id;

    // Verify reviewer is an admin
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

    // Fetch the contribution
    const { data: contribution, error: fetchError } = await supabase
      .from("babel_contributions")
      .select(`
        *,
        submitter:profiles!babel_contributions_user_id_fkey(display_name)
      `)
      .eq("id", id)
      .single();

    if (fetchError || !contribution) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (contribution.status !== "pending") {
      return NextResponse.json(
        { error: `Contribution already ${contribution.status}` },
        { status: 400 }
      );
    }

    // Atomically claim the row to prevent concurrent approvals
    const newStatus = action === "approve" ? "approved" : "rejected";
    const { data: claimed, error: claimError } = await supabase
      .from("babel_contributions")
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

    let github_issue_url: string | null = null;

    // If approving, create GitHub issue after claiming
    if (action === "approve") {
      try {
        // Get submitter info
        const { data: submitter } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", contribution.user_id)
          .single();

        github_issue_url = await createGitHubIssue({
          id: contribution.id,
          type: contribution.type,
          entry_id: contribution.entry_id,
          entry_type: contribution.entry_type,
          entry_category: contribution.entry_category,
          title: contribution.title,
          description: contribution.description,
          suggested_changes: contribution.suggested_changes,
          submitter_name: submitter?.display_name || undefined,
        });

        // Store the GitHub issue URL
        await supabase
          .from("babel_contributions")
          .update({ github_issue_url })
          .eq("id", id);
      } catch (githubError) {
        console.error("GitHub issue creation failed:", githubError);
        // Row is already marked approved; log but don't revert
        // The issue can be created manually later
      }
    }

    return NextResponse.json({
      success: true,
      action,
      github_issue_url,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch a single contribution (for admin view or owner)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const { data: contribution, error } = await supabase
      .from("babel_contributions")
      .select(`
        *,
        submitter:profiles!babel_contributions_user_id_fkey(display_name),
        reviewer:profiles!babel_contributions_reviewed_by_fkey(display_name)
      `)
      .eq("id", id)
      .single();

    if (error || !contribution) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    // Verify user is either the owner or an admin
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
