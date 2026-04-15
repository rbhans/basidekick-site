import { NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["resolve", "dismiss", "reopen"]),
  admin_notes: z.string().max(5000).optional(),
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

export async function PATCH(
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = actionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { action, admin_notes } = parseResult.data;

    const statusByAction = {
      resolve: "resolved",
      dismiss: "dismissed",
      reopen: "pending",
    } as const;

    const newStatus = statusByAction[action];
    const isClosing = action !== "reopen";

    const { data: updated, error: updateError } = await supabase
      .from("content_reports")
      .update({
        status: newStatus,
        admin_notes: admin_notes ?? null,
        resolved_by: isClosing ? user.id : null,
        resolved_at: isClosing ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      console.error("content_reports update error:", updateError);
      return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (err) {
    console.error("content-reports PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
