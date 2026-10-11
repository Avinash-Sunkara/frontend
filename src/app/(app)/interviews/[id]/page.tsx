"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Layers, MessageCircle, Send, Trash2 } from "lucide-react";
import { Async, Button, Card, Empty, Skeleton, Textarea } from "@/components/ui/kit";
import { Rich } from "@/components/features/Rich";
import { useAction, useGet } from "@/hooks/useApi";
import { cn, diffColor, initials, timeAgo } from "@/lib/utils";
import type { Comment, Interview } from "@/lib/types";
import { StatusPill } from "@/components/features/StatusPill";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const q = useGet<Interview>(`/interviews/${id}`);
  const cm = useGet<Comment[]>(`/interviews/${id}/comments`);
  const [text, setText] = useState("");
  const like = useAction<void, void>("post", `/interviews/${id}/like`, { invalidate: [[`/interviews/${id}`, undefined]], optimistic: () => {
    qc.setQueryData<Interview>([`/interviews/${id}`, undefined], (o) => o && { ...o, liked: !o.liked, likes: o.likes + (o.liked ? -1 : 1) }); }, rollback: () => q.refetch() });
  const post = useAction<{ body: string }, void>("post", `/interviews/${id}/comments`, { success: "Comment posted", onSuccess: () => { setText(""); cm.refetch(); q.refetch(); } });
  const del = useAction<string, void>("delete", (cid) => `/interviews/${id}/comments/${cid}`, { onSuccess: () => { cm.refetch(); q.refetch(); } });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/interviews" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All experiences</Link>
      <Async q={q} skeleton={<Skeleton className="h-[600px]" />}>
        {(i) => (<>
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-xl font-bold text-brand">{i.company[0]}</span>
              <div><p className="text-xl font-bold">{i.company}</p><p className="text-muted">{i.role}{i.level ? ` (${i.level})` : ""}</p></div></div><StatusPill s={i.status} /></div>
            <div className="mt-4 flex gap-2"><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", diffColor(i.difficulty))}>{i.difficulty}</span><span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"><Layers className="h-3 w-3" />{i.rounds} rounds</span></div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">{i.title}</h1>
            <hr className="my-5 border-line" />
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand to-emerald-700 text-sm font-bold text-white">{initials(i.author || "Anonymous")}</span>
              <div><p className="text-sm font-semibold">{i.author || "Anonymous"}</p><p className="text-xs text-faint">{timeAgo(i.createdAt)}{i.edited ? " · edited" : ""}</p></div></div>
            <div className="mt-4 flex flex-wrap gap-2">{i.tags.map((t) => <span key={t} className="rounded-lg bg-raised px-2.5 py-1 text-xs text-muted">{t}</span>)}</div>
          </Card>
          <Card className="space-y-2 p-6">
            {i.background && (<><h2 className="border-b border-line pb-2 text-2xl font-bold">Background</h2><p className="py-3 leading-relaxed">{i.background}</p></>)}
            {!!i.roundDetails?.length && (<><h2 className="border-b border-line pb-2 text-2xl font-bold">Round-by-round</h2>
              {i.roundDetails.map((r, k) => <div key={k} className="py-3"><h3 className="text-lg font-bold text-brand">{k + 1}. {r.title}</h3><Rich html={r.body} /></div>)}</>)}
            {!!i.questions?.length && (<><h2 className="border-b border-line pb-2 text-2xl font-bold">Questions asked</h2><ul className="list-disc space-y-1.5 py-3 pl-6">{i.questions.map((x, k) => <li key={k}>{x}</li>)}</ul></>)}
            {i.verdict && (<><h2 className="border-b border-line pb-2 text-2xl font-bold">Verdict</h2><p className="py-3">{i.verdict}</p></>)}
          </Card>
          <div className="flex gap-3 border-t border-line pt-5">
            <button onClick={() => like.mutate(undefined as never)} aria-pressed={i.liked} className={cn("flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold", i.liked ? "border-brand/40 bg-brand/10 text-brand" : "border-line text-muted hover:text-fg")}><Heart className={cn("h-4 w-4", i.liked && "fill-brand")} />{i.likes}</button>
            <span className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted"><MessageCircle className="h-4 w-4" />{i.comments} comments</span>
          </div>
          <section className="space-y-4"><h2 className="flex items-center gap-2 text-lg font-bold"><MessageCircle className="h-5 w-5 text-brand" />Discussion <span className="text-sm font-normal text-muted">({cm.data?.length ?? 0})</span></h2>
            <Card className="p-4"><Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Add a thoughtful question or share a tip…" aria-label="Comment" />
              <div className="mt-3 flex justify-end"><Button disabled={text.trim().length < 2} loading={post.isPending} onClick={() => post.mutate({ body: text.trim() })}><Send className="h-4 w-4" />Post comment</Button></div></Card>
            <Async q={cm} skeleton={<Skeleton className="h-20" />} isEmpty={(d) => d.length === 0} empty={<p className="text-sm text-muted">No comments yet — be the first to respond.</p>}>
              {(list) => <div className="space-y-3">{list.map((c) => (
                <Card key={c.id} className="p-4"><div className="flex items-center justify-between"><p className="text-sm"><b>{c.author}</b> <span className="text-xs text-faint">· {timeAgo(c.createdAt)}</span></p>
                  {c.mine && <button aria-label="Delete comment" onClick={() => del.mutate(c.id)} className="text-faint hover:text-hard"><Trash2 className="h-4 w-4" /></button>}</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{c.body}</p></Card>))}</div>}
            </Async>
          </section>
        </>)}
      </Async>
    </div>
  );
}
