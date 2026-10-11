"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Flag, StickyNote, Youtube, Check, ExternalLink, Lightbulb, Lock } from "lucide-react";
import { cn, diffColor } from "@/lib/utils";
import { useAction } from "@/hooks/useApi";
import type { Problem } from "@/lib/types";
import { CompanyLogos } from "./CompanyLogos";
import { NoteModal } from "./NoteModal";

type Flagname = "solved" | "bookmarked" | "revision";
const icoBtn = "grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-brand/40 hover:text-brand";

/** One DSA problem row/card. Optimistic toggles; progress lives on our side, LeetCode just opens in a new tab. */
export function ProblemRow({ p: initial, compact }: { p: Problem; compact?: boolean }) {
  const qc = useQueryClient();
  const [p, setP] = useState(initial);
  useEffect(() => setP(initial), [initial]);
  const [note, setNote] = useState(false);
  const st = p.state ?? { solved: false, bookmarked: false, revision: false, hintUsed: false };
  const refresh = () => ["/sheets/overview", "/dashboard", "/revision", "/bookmarks", "/activity/summary", "/activity/calendar"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const toggle = (f: Flagname) => {
    const prev = p; const val = !st[f];
    setP({ ...p, state: { ...st, [f]: val } });
    return { prev, val };
  };
  const flagPath: Record<Flagname, string> = { solved: "solved", bookmarked: "bookmark", revision: "revision" };
  const act = useAction<{ f: Flagname; value: boolean }, void>("put", (b) => `/problems/${p.id}/${flagPath[b.f]}`, { onSuccess: refresh });
  const flip = (f: Flagname) => {
    if (act.isPending) return;
    const { prev, val } = toggle(f);
    act.mutate({ f, value: val }, { onError: () => setP(prev) });
  };


  return (
    <div className={cn("group flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-3 transition-colors last:border-0 hover:bg-raised/50 sm:px-4", st.solved && "bg-brand/5")}>
      <button type="button" disabled={act.isPending} onClick={() => flip("solved")} aria-pressed={st.solved} aria-label={st.solved ? "Mark unsolved" : "Mark solved"}
        className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors", st.solved ? "border-brand bg-brand text-brand-ink" : "border-line hover:border-brand/60")}>
        {st.solved && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <span className="w-6 shrink-0 text-right font-mono text-xs text-faint">{p.number}</span>
      <Link href={`/problems/${p.id}`} className="min-w-0 flex-1 basis-48">
        <span className={cn("block truncate text-[15px] font-semibold hover:text-brand", st.solved && "text-muted line-through decoration-brand/60")}>{p.title}</span>
        {!compact && (p.pattern || p.topic) && <span className="block truncate text-xs text-faint">{[p.topic, p.pattern].filter(Boolean).join(" · ")}</span>}
      </Link>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {st.hintUsed && <span title="Solved with a hint" className="text-medium"><Lightbulb className="h-4 w-4" /></span>}
        {p.locked && <Lock className="h-4 w-4 text-medium" aria-label="Premium" />}
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", diffColor(p.difficulty))}>{p.difficulty}</span>
        <CompanyLogos companies={p.companies} max={3} />
        {p.leetcodeUrl && <a href={p.leetcodeUrl} target="_blank" rel="noopener noreferrer" title="Solve on LeetCode" aria-label="Solve on LeetCode" className={cn(icoBtn, "text-medium")}><ExternalLink className="h-4 w-4" /></a>}
        {p.gfgUrl && <a href={p.gfgUrl} target="_blank" rel="noopener noreferrer" title="Practice on GeeksforGeeks" aria-label="Practice on GeeksforGeeks" className={cn(icoBtn, "text-brand")}><ExternalLink className="h-4 w-4" /></a>}
        {p.youtubeUrl ? <a href={p.youtubeUrl} target="_blank" rel="noopener noreferrer" title="Watch explanation" aria-label="Watch explanation" className={cn(icoBtn, "text-red-500")}><Youtube className="h-4 w-4" /></a>
          : <span className={cn(icoBtn, "pointer-events-none opacity-30")}><Youtube className="h-4 w-4" /></span>}
        <button type="button" disabled={act.isPending} onClick={() => flip("bookmarked")} aria-pressed={st.bookmarked} aria-label="Bookmark" title="Bookmark" className={cn(icoBtn, st.bookmarked && "border-brand/40 text-brand")}><Bookmark className={cn("h-4 w-4", st.bookmarked && "fill-brand")} /></button>
        <button type="button" disabled={act.isPending} onClick={() => flip("revision")} aria-pressed={st.revision} aria-label="Flag for revision" title="Flag for revision" className={cn(icoBtn, st.revision && "border-medium/40 text-medium")}><Flag className={cn("h-4 w-4", st.revision && "fill-medium")} /></button>
        <button onClick={() => setNote(true)} aria-label="Personal note" title="Add note" className={cn(icoBtn, st.note && "border-brand/40 text-brand")}><StickyNote className="h-4 w-4" /></button>
      </div>
      <NoteModal open={note} onClose={() => setNote(false)} problemId={p.id} title={p.title} initial={st.note}
        onSaved={(n) => setP({ ...p, state: { ...st, note: n } })} />
    </div>
  );
}
