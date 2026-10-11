"use client";
import { use, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, ExternalLink, FileText, ImageIcon, Link2, PlayCircle } from "lucide-react";
import { Async, Card, Ring, Skeleton } from "@/components/ui/kit";
import { AccessGate } from "@/components/features/AccessGate";
import { Rich, youtubeEmbed } from "@/components/features/Rich";
import { useAction, useGet } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import type { Roadmap, RoadmapNode } from "@/lib/types";

const RIcon = { link: Link2, video: PlayCircle, pdf: FileText, image: ImageIcon, text: FileText } as const;

function Node({ n, depth, last, rid, onToggle }: { n: RoadmapNode; depth: number; last: boolean; rid: string; onToggle: (id: string, v: boolean) => void }) {
  const [open, setOpen] = useState(depth === 0);
  const has = !!(n.children?.length || n.resources?.length || n.description);
  return (
    <li className="relative pl-10">
      {!last && <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-line" />}
      <button aria-label={n.completed ? "Mark incomplete" : "Mark complete"} onClick={() => onToggle(n.id, !n.completed)}
        className={cn("absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border-2 transition-colors", n.completed ? "border-brand bg-brand text-brand-ink" : "border-line bg-bg hover:border-brand/60")}>
        {n.completed && <Check className="h-4 w-4" strokeWidth={3} />}</button>
      <div className="pb-5">
        <button onClick={() => has && setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-2 py-1 text-left">
          <span className={cn("font-bold", depth === 0 ? "text-lg" : "text-base", n.completed && "text-muted")}>{n.icon && <span className="mr-2">{n.icon}</span>}{n.title}</span>
          {has && <ChevronDown className={cn("ml-auto h-4 w-4 text-muted transition-transform", open && "rotate-180")} />}</button>
        <AnimatePresence initial={false}>{open && has && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {n.description && <div className="mb-3 text-sm text-muted"><Rich html={n.description} /></div>}
            {n.resources?.map((r) => { const I = RIcon[r.type]; const emb = r.type === "video" ? youtubeEmbed(r.url) : null; return (
              <div key={r.id} className="mb-2">
                {emb ? <div className="aspect-video overflow-hidden rounded-xl border border-line"><iframe src={emb} title={r.title} loading="lazy" allowFullScreen className="h-full w-full" /></div>
                  : r.type === "image" && r.url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.url} alt={r.title} loading="lazy" className="max-w-full rounded-xl border border-line" />
                  : r.type === "text" ? <Card className="p-4"><Rich html={r.content ?? ""} /></Card>
                  : <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-sm hover:border-brand/40"><I className="h-4 w-4 text-brand" /><span className="flex-1">{r.title}</span><ExternalLink className="h-3.5 w-3.5 text-faint" /></a>}
              </div>); })}
            {!!n.children?.length && <ul className="mt-3">{n.children.map((c, i) => <Node key={c.id} n={c} depth={depth + 1} last={i === n.children!.length - 1} rid={rid} onToggle={onToggle} />)}</ul>}
          </motion.div>)}</AnimatePresence>
      </div>
    </li>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useGet<Roadmap>(`/roadmaps/${id}`);
  const toggle = useAction<{ nodeId: string; completed: boolean }, void>("put", (b) => `/roadmaps/${id}/nodes/${b.nodeId}`, { onSuccess: () => q.refetch(), invalidate: [["/roadmaps"]] });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/roadmaps" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All roadmaps</Link>
      <Async q={q} skeleton={<Skeleton className="h-[500px]" />}>
        {(r) => (<>
          <div className="flex items-center gap-5"><Ring value={r.completion} size={88} stroke={8}><span className="text-lg font-extrabold">{r.completion}%</span></Ring>
            <div><h1 className="text-3xl font-extrabold tracking-tight">{r.title}</h1>{r.description && <p className="mt-1 text-muted">{r.description}</p>}</div></div>
          {r.locked ? <AccessGate kind="roadmap" id={r.id} price={r.price} access={r.access === "PRIVATE" ? "PRIVATE" : "PREMIUM"} title={r.title} onUnlocked={() => q.refetch()} /> : (
            <Card className="p-6"><ul>{r.sections?.map((s, i) => <Node key={s.id} n={s} depth={0} last={i === r.sections!.length - 1} rid={r.id} onToggle={(nodeId, completed) => toggle.mutate({ nodeId, completed })} />)}</ul></Card>)}
        </>)}
      </Async>
    </div>
  );
}
