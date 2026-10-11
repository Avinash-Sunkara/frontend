"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lightbulb } from "lucide-react";
import { Async, Badge, Button, Card, Skeleton } from "@/components/ui/kit";
import { Rich } from "@/components/features/Rich";
import { useGet } from "@/hooks/useApi";
import { cn, diffColor } from "@/lib/utils";
import type { Puzzle } from "@/lib/types";

/** Admins may write HTML or plain text; plain text keeps its line breaks. */
const Body = ({ text }: { text: string }) => (/<\/?[a-z][\s\S]*>/i.test(text) ? <Rich html={text} /> : <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>);

export default function PuzzlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const q = useGet<Puzzle>(`/puzzles/${slug}`);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/puzzles" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />Back to puzzles</Link>
      <Async q={q} skeleton={<Skeleton className="h-96" />}>{(p) => <PuzzleBody key={p.id} p={p} />}</Async>
    </div>
  );
}

function PuzzleBody({ p }: { p: Puzzle }) {
  const [hintsShown, setHints] = useState(0); const [showSolution, setShowSolution] = useState(false);
  return (<>
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-2"><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", diffColor(p.difficulty))}>{p.difficulty}</span>{p.pattern && <Badge tone="brand">{p.pattern}</Badge>}</div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{p.title}</h1>
      <div className="mt-4"><Body text={p.description} /></div>
      {p.imageUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt="" loading="lazy" className="mt-4 rounded-2xl border border-line" />}
    </Card>
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Lightbulb className="h-5 w-5 text-medium" />Hints</h2>
      {p.hints.length ? (<div className="mt-3 space-y-2">
        {p.hints.slice(0, hintsShown).map((h, i) => <p key={i} className="rounded-xl bg-raised p-3 text-sm"><b className="text-brand">Hint {i + 1}.</b> {h}</p>)}
        {hintsShown < p.hints.length && <Button variant="outline" size="sm" onClick={() => setHints(hintsShown + 1)}>Reveal hint {hintsShown + 1}</Button>}
      </div>) : <p className="mt-2 text-sm text-muted">No hints for this puzzle.</p>}
    </Card>
    {p.solution && <Card className="p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Solution</h2>
        <Button variant="outline" size="sm" onClick={() => setShowSolution((v) => !v)}>{showSolution ? <><EyeOff className="h-4 w-4" />Hide</> : <><Eye className="h-4 w-4" />Show solution</>}</Button></div>
      {showSolution ? <div className="mt-3"><Body text={p.solution} /></div> : <p className="mt-2 text-sm text-muted">Give it a real attempt first, then peek.</p>}
    </Card>}
  </>);
}
