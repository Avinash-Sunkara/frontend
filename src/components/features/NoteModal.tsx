"use client";
import { useEffect, useState } from "react";
import { Button, Modal, Textarea } from "@/components/ui/kit";
import { useAction } from "@/hooks/useApi";

export function NoteModal({ open, onClose, problemId, title, initial, onSaved }: { open: boolean; onClose: () => void; problemId: string; title: string; initial?: string; onSaved?: (n: string) => void }) {
  const [v, setV] = useState(initial ?? "");
  useEffect(() => { if (open) setV(initial ?? ""); }, [open, initial]);
  const save = useAction<{ note: string }, void>("put", `/problems/${problemId}/note`, { success: "Note saved", invalidate: [["/revision"]], onSuccess: (_r, b) => { onSaved?.(b.note); onClose(); } });
  return (
    <Modal open={open} onClose={onClose} title={`Note · ${title}`}>
      <Textarea value={v} onChange={(e) => setV(e.target.value)} placeholder="Key insight, edge case, or the trick you missed…" rows={7} maxLength={5000} autoFocus />
      <div className="mt-4 flex justify-between"><span className="text-xs text-faint">{v.length}/5000 · private to you</span>
        <div className="flex gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate({ note: v })}>Save note</Button></div></div>
    </Modal>
  );
}
