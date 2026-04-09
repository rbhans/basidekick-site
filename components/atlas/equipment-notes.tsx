"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CaretUp } from "@phosphor-icons/react";

interface EquipmentNote {
  id: string;
  content: string;
  upvote_count: number;
  created_at: string;
  author?: { display_name: string | null; avatar_url: string | null } | null;
}

interface EquipmentNotesProps {
  equipmentId: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function EquipmentNotes({ equipmentId }: EquipmentNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<EquipmentNote[]>([]);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"top" | "recent">("top");
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("equipment_notes")
        .select(
          "id, content, upvote_count, created_at, author:profiles(display_name, avatar_url)"
        )
        .eq("equipment_id", equipmentId)
        .order("upvote_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data as EquipmentNote[]);
        if (user) {
          const noteIds = data.map((n: { id: string }) => n.id);
          if (noteIds.length > 0) {
            const { data: votes } = await supabase
              .from("equipment_note_votes")
              .select("note_id")
              .eq("user_id", user.id)
              .in("note_id", noteIds);

            setVoted(new Set((votes || []).map((v: { note_id: string }) => v.note_id)));
          }
        }
      }

      setLoading(false);
    };

    fetchNotes();
  }, [equipmentId, user]);

  const sortedNotes = useMemo(() => {
    if (sortBy === "top") return notes;
    return [...notes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notes, sortBy]);

  const handleUpvote = async (noteId: string) => {
    if (!user || voted.has(noteId)) return;

    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("equipment_note_votes")
      .insert({ note_id: noteId, user_id: user.id, vote_type: 1 });

    if (!error) {
      setVoted((prev) => new Set(prev).add(noteId));
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, upvote_count: (note.upvote_count || 0) + 1 }
            : note
        )
      );
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!newNote.trim()) return;

    setError(null);
    if (newNote.trim().length > 500) {
      setError("Notes must be 500 characters or less.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("equipment_notes")
      .insert({
        equipment_id: equipmentId,
        author_id: user.id,
        content: newNote.trim(),
      })
      .select(
        "id, content, upvote_count, created_at, author:profiles(display_name, avatar_url)"
      )
      .single();

    if (error) {
      setError("Failed to add note. Please try again.");
      return;
    }

    setNotes((prev) => [data as EquipmentNote, ...prev]);
    setNewNote("");
  };

  return (
    <div>
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-5">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">03 /</span>
        <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
          Field notes
        </h2>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
        <div className="ml-3.5 flex items-center gap-1.5">
          <button
            onClick={() => setSortBy("top")}
            className={`font-mono text-[10px] uppercase tracking-[1.2px] px-2 py-1 border rounded-sm transition-colors ${
              sortBy === "top"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={`font-mono text-[10px] uppercase tracking-[1.2px] px-2 py-1 border rounded-sm transition-colors ${
              sortBy === "recent"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {user && (
        <div className="mb-6">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Share a helpful note or field tip…"
            rows={3}
            maxLength={500}
            className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums">
              {newNote.length} / 500
            </span>
            <button
              onClick={handleSubmit}
              disabled={!newNote.trim()}
              className="px-4 py-2 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add note
            </button>
          </div>
          {error && (
            <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-destructive mt-2">
              {error}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="font-heading italic text-[15px] text-muted-foreground">Loading notes…</p>
      ) : sortedNotes.length === 0 ? (
        <p className="font-heading italic text-[15px] text-muted-foreground">
          No notes yet. Be the first to add one.
        </p>
      ) : (
        <div className="space-y-0">
          {sortedNotes.map((note) => {
            const hasVoted = voted.has(note.id);
            return (
              <div
                key={note.id}
                className="grid grid-cols-[44px_1fr] gap-4 py-4 border-b border-muted"
              >
                <button
                  onClick={() => handleUpvote(note.id)}
                  disabled={!user || hasVoted}
                  className={`flex flex-col items-center justify-start pt-1 ${
                    hasVoted ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  } disabled:cursor-not-allowed transition-colors`}
                >
                  <CaretUp className="w-4 h-4" weight={hasVoted ? "fill" : "regular"} />
                  <span className="font-mono text-[11px] tabular-nums mt-0.5">
                    {note.upvote_count || 0}
                  </span>
                </button>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground mb-1.5">
                    {note.author?.display_name || "Anonymous"} ·{" "}
                    <span className="tabular-nums">{formatTimeAgo(note.created_at)}</span>
                  </div>
                  <p className="text-[14px] text-foreground leading-[1.55] whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
