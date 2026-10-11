"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, Check, ExternalLink, Flag, Lightbulb, StickyNote, Youtube } from "lucide-react";
import { Async, Badge, Button, Card, LinkButton, Skeleton } from "@/components/ui/kit";
import { Rich, youtubeEmbed } from "@/components/features/Rich";
import { CompanyLogo } from "@/components/features/CompanyLogos";
import { AccessGate } from "@/components/features/AccessGate";
import { NoteModal } from "@/components/features/NoteModal";
import { useAction, useGet } from "@/hooks/useApi";
import { cn, diffColor } from "@/lib/utils";
import type { Problem } from "@/lib/types";

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const q = useGet<Problem>(`/problems/${id}`);
  const [note, setNote] = useState(false);
  const [hintsShown, setHints] = useState(0);
  const key = [`/problems/${id}`, undefined];
  const reload = () => { qc.invalidateQueries({ queryKey: key }); ["/sheets/overview", "/dashboard", "/revision", "/bookmarks", "/activity/summary", "/activity/calendar"].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); };
  const useFlag = (path: string) => useAction<{ value: boolean }, void>("put", `/problems/${id}/${path}`, { onSuccess: reload });
  const solved = useFlag("solved"), bm = useFlag("bookmark"), rev = useFlag("revision");
  const hint = useAction<void, void>("post", `/problems/${id}/hint`, { onSuccess: reload });
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/sheets" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />Back to sheets</Link>
      <Async q={q} skeleton={<Skeleton className="h-96" />}>
        {(p) => {
          const st = p.state ?? { solved: false, bookmarked: false, revision: false, hintUsed: false };
          const embed = youtubeEmbed(p.youtubeUrl);
          if (p.locked) return <AccessGate kind="problem" id={p.id} price={p.price} access={p.access === "PRIVATE" ? "PRIVATE" : "PREMIUM"} title={p.title} onUnlocked={reload} />;
          return (<>
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm text-faint">#{p.number}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", diffColor(p.difficulty))}>{p.difficulty}</span>
                {p.topic && <Badge>{p.topic}</Badge>}{p.pattern && <Badge tone="brand">{p.pattern}</Badge>}{p.tags?.map((t) => <Badge key={t}>{t}</Badge>)}</div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{p.title}</h1>
              {p.companies.length > 0 && (<div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">Asked at</span>{p.companies.map((c) => <span key={c.id} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-3 text-sm"><CompanyLogo c={c} size={22} />{c.name}</span>)}</div>)}
              <div className="mt-6 flex flex-wrap gap-2">
                {p.leetcodeUrl && <LinkButton href={p.leetcodeUrl} external><ExternalLink className="h-4 w-4" />Solve on LeetCode</LinkButton>}
                {p.youtubeUrl && <LinkButton href={p.youtubeUrl} external variant="outline"><Youtube className="h-4 w-4 text-red-500" />Watch Explanation</LinkButton>}
                <Button variant={st.solved ? "secondary" : "outline"} loading={solved.isPending} onClick={() => solved.mutate({ value: !st.solved })}><Check className="h-4 w-4" />{st.solved ? "Solved" : "Mark Solved"}</Button>
                <Button variant={st.bookmarked ? "secondary" : "outline"} loading={bm.isPending} onClick={() => bm.mutate({ value: !st.bookmarked })}><Bookmark className={cn("h-4 w-4", st.bookmarked && "fill-brand text-brand")} />{st.bookmarked ? "Bookmarked" : "Bookmark"}</Button>
                <Button variant={st.revision ? "secondary" : "outline"} loading={rev.isPending} onClick={() => rev.mutate({ value: !st.revision })}><Flag className={cn("h-4 w-4", st.revision && "fill-medium text-medium")} />{st.revision ? "Flagged" : "Flag for Revision"}</Button>
                <Button variant="outline" onClick={() => setNote(true)}><StickyNote className="h-4 w-4" />{st.note ? "Edit Note" : "Add Note"}</Button>
              </div>
            </Card>
            {p.description && <Card className="p-6"><h2 className="mb-2 text-lg font-bold">Description</h2><Rich html={p.description} /></Card>}
            {!!p.images?.length && <div className="grid gap-3 sm:grid-cols-2">{p.images.map((s) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={s} src={s} alt="" loading="lazy" className="rounded-2xl border border-line" />)}</div>}
            <Card className="p-6"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><Lightbulb className="h-5 w-5 text-medium" />Hints</h2>
              <Badge tone={st.hintUsed ? "medium" : "neutral"}>{st.hintUsed ? "Hint used" : "No hint used"}</Badge></div>
              {p.hints?.length ? (<div className="mt-3 space-y-2">
                {p.hints.slice(0, hintsShown).map((h, i) => <p key={i} className="rounded-xl bg-raised p-3 text-sm"><b className="text-brand">Hint {i + 1}.</b> {h}</p>)}
                {hintsShown < p.hints.length && <Button variant="outline" size="sm" onClick={() => { setHints(hintsShown + 1); if (!st.hintUsed) hint.mutate(undefined as never); }}>Reveal hint {hintsShown + 1}</Button>}
              </div>) : <p className="mt-2 text-sm text-muted">No hints for this problem.</p>}
            </Card>
            {p.quickNotes && <Card className="p-6"><h2 className="mb-2 text-lg font-bold">Quick revision notes</h2><Rich html={p.quickNotes} /></Card>}
            {embed && <Card className="overflow-hidden"><div className="aspect-video"><iframe src={embed} title={`${p.title} explanation`} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full" /></div></Card>}
            {st.note && <Card className="p-6"><h2 className="mb-2 text-lg font-bold">Your note</h2><p className="whitespace-pre-wrap text-sm text-muted">{st.note}</p></Card>}
            <NoteModal open={note} onClose={() => setNote(false)} problemId={p.id} title={p.title} initial={st.note} onSaved={reload} />
          </>);
        }}
      </Async>
    </div>
  );
}
