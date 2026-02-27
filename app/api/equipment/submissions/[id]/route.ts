import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import { Octokit } from "octokit";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reviewer_notes: z.string().optional(),
});

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

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

async function createGitHubIssue(submission: {
  id: string;
  type: string;
  entry_id: string | null;
  brand_name: string | null;
  type_name: string | null;
  model_name: string | null;
  model_numbers: string[] | null;
  protocols: string[] | null;
  model_status: string | null;
  description: string | null;
  manufacturer_url: string | null;
  image_url: string | null;
  suggested_changes: Record<string, unknown> | null;
  submitter_email?: string;
  submitter_name?: string;
}) {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error("GitHub token not configured");
  }

  const octokit = new Octokit({ auth: githubToken });

  const typeLabel = {
    error: "Error Report",
    edit: "Edit Suggestion",
    new_entry: "New Entry Request",
  }[submission.type] || submission.type;

  let body = `## Submission Type: ${typeLabel}

`;

  if (submission.model_name) {
    body += `**Model:** ${submission.model_name}
`;
  }
  if (submission.brand_name) {
    body += `**Brand:** ${submission.brand_name}
`;
  }
  if (submission.type_name) {
    body += `**Type:** ${submission.type_name}
`;
  }
  if (submission.model_numbers && submission.model_numbers.length > 0) {
    body += `**Model Numbers:** ${submission.model_numbers.join(", ")}
`;
  }
  if (submission.protocols && submission.protocols.length > 0) {
    body += `**Protocols:** ${submission.protocols.join(", ")}
`;
  }
  if (submission.model_status) {
    body += `**Status:** ${submission.model_status}
`;
  }
  if (submission.manufacturer_url) {
    body += `**Manufacturer URL:** ${submission.manufacturer_url}
`;
  }
  if (submission.image_url) {
    body += `**Image URL:** ${submission.image_url}
`;
  }

  if (submission.submitter_name || submission.submitter_email) {
    body += `
**Submitted by:** ${submission.submitter_name || "Anonymous"}`;
    if (submission.submitter_email) {
      body += ` (${submission.submitter_email})`;
    }
    body += "\n";
  }

  if (submission.description) {
    body += `
### Description
${submission.description}
`;
  }

  if (submission.suggested_changes && Object.keys(submission.suggested_changes).length > 0) {
    body += `
### Suggested Changes
\`\`\`json
${JSON.stringify(submission.suggested_changes, null, 2)}
\`\`\`
`;
  }

  body += `
---
*Submitted via BAS Atlas*
`;
  body += `*Submission ID: ${submission.id}*`;

  const labels = ["contribution", "atlas"];
  if (submission.type === "error") labels.push("bug");
  if (submission.type === "edit") labels.push("enhancement");
  if (submission.type === "new_entry") labels.push("new-entry");

  const response = await octokit.rest.issues.create({
    owner: "rbhans",
    repo: "bas-atlas",
    title: submission.model_name || submission.entry_id || "BAS Atlas submission",
    body,
    labels,
  });

  return response.data.html_url;
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
      return NextResponse.json({ error: "Invalid input", details: parseResult.error.flatten() }, { status: 400 });
    }

    const { action, reviewer_notes } = parseResult.data;
    const reviewer_id = user.id;

    const { data: reviewerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", reviewer_id)
      .single();

    if (profileError || !reviewerProfile?.is_admin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { data: submission, error: fetchError } = await supabase
      .from("equipment_submissions")
      .select(`
        *,
        submitter:profiles!equipment_submissions_user_id_fkey(display_name)
      `)
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.review_status !== "pending") {
      return NextResponse.json({ error: `Submission already ${submission.review_status}` }, { status: 400 });
    }

    // Atomically claim the row to prevent concurrent approvals
    const newStatus = action === "approve" ? "approved" : "rejected";
    const { data: claimed, error: claimError } = await supabase
      .from("equipment_submissions")
      .update({
        review_status: newStatus,
        reviewed_by: reviewer_id,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewer_notes || null,
      })
      .eq("id", id)
      .eq("review_status", "pending")
      .select("id")
      .single();

    if (claimError || !claimed) {
      return NextResponse.json(
        { error: "Submission was already processed by another reviewer" },
        { status: 409 }
      );
    }

    let github_issue_url: string | null = null;

    if (action === "approve") {
      try {
        const { data: submitter } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", submission.user_id)
          .single();

        const { data: userData } = await supabase.auth.admin.getUserById(submission.user_id);

        github_issue_url = await createGitHubIssue({
          id: submission.id,
          type: submission.type,
          entry_id: submission.entry_id,
          brand_name: submission.brand_name,
          type_name: submission.type_name,
          model_name: submission.model_name,
          model_numbers: submission.model_numbers,
          protocols: submission.protocols,
          model_status: submission.model_status,
          description: submission.description,
          manufacturer_url: submission.manufacturer_url,
          image_url: submission.image_url,
          suggested_changes: submission.suggested_changes,
          submitter_name: submitter?.display_name || undefined,
          submitter_email: userData?.user?.email || undefined,
        });

        // Store the GitHub issue URL
        await supabase
          .from("equipment_submissions")
          .update({ github_issue_url })
          .eq("id", id);
      } catch (githubError) {
        console.error("GitHub issue creation failed:", githubError);
        // Row is already marked approved; log but don't revert
        // The issue can be created manually later
      }
    }

    return NextResponse.json({ success: true, action, github_issue_url });
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

    const { data: submission, error } = await supabase
      .from("equipment_submissions")
      .select(`
        *,
        submitter:profiles!equipment_submissions_user_id_fkey(display_name),
        reviewer:profiles!equipment_submissions_reviewed_by_fkey(display_name)
      `)
      .eq("id", id)
      .single();

    if (error || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const isOwner = submission.user_id === user.id;
    const isAdmin = userProfile?.is_admin === true;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized: You can only view your own submissions" }, { status: 403 });
    }

    return NextResponse.json({ submission });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
