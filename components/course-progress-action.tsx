"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";

export function CourseProgressAction({ userId, lessonSlug, initiallyComplete }: { userId: string | null; lessonSlug: string; initiallyComplete: boolean }) {
  const auth = useAuth();
  const router = useRouter();
  const [complete, setComplete] = useState(initiallyComplete);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function markComplete() {
    if (!userId) {
      auth.requestSignIn("track this course", window.location.pathname);
      return;
    }
    const client = createClient();
    if (!client || busy) return;
    setBusy(true);
    setStatus("");
    const { data: row, error: readError } = await client.from("course_progress").select("lessons_completed, started_at").eq("user_id", userId).eq("course_slug", "intro-to-bas").maybeSingle();
    if (readError) {
      setStatus(readError.message);
      setBusy(false);
      return;
    }
    const lessons = new Set<string>((row?.lessons_completed as string[] | null) ?? []);
    lessons.add(lessonSlug);
    const now = new Date().toISOString();
    const { error } = await client.from("course_progress").upsert({
      user_id: userId,
      course_slug: "intro-to-bas",
      lessons_completed: [...lessons],
      last_lesson_slug: lessonSlug,
      started_at: row?.started_at ?? now,
      last_active_at: now,
    }, { onConflict: "user_id,course_slug" });
    if (error) setStatus(error.message);
    else {
      setComplete(true);
      router.refresh();
    }
    setBusy(false);
  }

  return <div className="course-progress-action"><button className={complete ? "button quiet" : "button primary"} type="button" disabled={busy || complete} onClick={markComplete}><CheckCircle size={16} weight={complete ? "fill" : "regular"} />{complete ? "Lesson complete" : busy ? "Saving…" : userId ? "Mark complete" : "Sign in to track"}</button>{status && <p className="form-status error" role="alert">{status}</p>}</div>;
}
