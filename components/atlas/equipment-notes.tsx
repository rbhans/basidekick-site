"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CaretUp, Clock } from "@phosphor-icons/react";

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
        .select("id, content, upvote_count, created_at, author:profiles(display_name, avatar_url)")
        .eq("equipment_id", equipmentId)
        .order("upvote_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data as EquipmentNote[]);
        if (user) {
          const noteIds = data.map((n) => n.id);
          if (noteIds.length > 0) {
            const { data: votes } = await supabase
              .from("equipment_note_votes")
              .select("note_id")
              .eq("user_id", user.id)
              .in("note_id", noteIds);

            setVoted(new Set((votes || []).map((v) => v.note_id)));
          }
        }
      }

      setLoading(false);
    };

    fetchNotes();
  }, [equipmentId, user]);

  const sortedNotes = useMemo(() => {
    if (sortBy === "top") return notes;
    return [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      .select("id, content, upvote_count, created_at, author:profiles(display_name, avatar_url)")
      .single();

    if (error) {
      setError("Failed to add note. Please try again.");
      return;
    }

    setNotes((prev) => [data as EquipmentNote, ...prev]);
    setNewNote("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notes</h2>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "top" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("top")}
          >
            Top
          </Button>
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("recent")}
          >
            <Clock className="size-3 mr-1" />
            Recent
          </Button>
        </div>
      </div>

      {user && (
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Share a helpful note or tip..."
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{newNote.length} / 500</span>
            <Button size="sm" onClick={handleSubmit} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading notes...</p>
      ) : sortedNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet. Be the first to add one.</p>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <div key={note.id} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">
                  {note.author?.display_name || "Anonymous"} · {new Date(note.created_at).toLocaleDateString()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpvote(note.id)}
                  disabled={!user || voted.has(note.id)}
                  className="text-muted-foreground"
                >
                  <CaretUp className="size-4" />
                  <span className="ml-1 text-xs">{note.upvote_count || 0}</span>
                </Button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
