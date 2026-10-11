"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import { Async, Badge, Button, Card, Field, Modal, Select, Skeleton } from "@/components/ui/kit";
import { Heatmap } from "@/components/features/Heatmap";
import { Stat } from "@/components/features/bits";
import { useAction, useGet } from "@/hooks/useApi";
import { fmtDuration, timeAgo } from "@/lib/utils";

interface Detail {
  id: string; fullName: string; username: string; email: string; blocked: boolean; role: string; lastActiveAt?: string;
  solved: number; streak: number; notesWritten: number; bookmarks: number; revision: number; studyMinutes: number;
  contributions: { date: string; count: number }[]; contentViewed: { title: string; kind: string; at: string }[];
  purchases: { id: string; title: string; kind: string; amount: number; status: string; at: string }[];
  entitlements: { id: string; kind: string; title: string; type: "FREE" | "PREMIUM" }[];
}
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useGet<Detail>(`/admin/users/${id}`);
  const [open, setOpen] = useState(false); const [kind, setKind] = useState("note"); const [target, setTarget] = useState(""); const [type, setType] = useState("FREE");
  const EP: Record<string, string> = { note: "/admin/notes", roadmap: "/admin/roadmaps", "cheat-sheet": "/admin/cheat-sheets", problem: "/admin/dsa/problems" };
  const items = useGet<{ id: string; title: string }[]>(open ? EP[kind] : null, { pageSize: 200 });
  const list: any[] = Array.isArray(items.data) ? items.data : (items.data as any)?.items ?? [];
  const grant = useAction<{ kind: string; contentId: string; type: string }, void>("post", `/admin/users/${id}/entitlements`, { success: "Access granted", onSuccess: () => { setOpen(false); q.refetch(); } });
  const revoke = useAction<string, void>("delete", (eid) => `/admin/users/${id}/entitlements/${eid}`, { success: "Access revoked", onSuccess: () => q.refetch() });
  return (
    <>
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />All users</Link>
      <Async q={q} skeleton={<Skeleton className="h-96" />}>
        {(u) => (<>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold">{u.fullName} <span className="text-base font-normal text-faint">@{u.username}</span></h1><p className="text-sm text-muted">{u.email} · last active {u.lastActiveAt ? timeAgo(u.lastActiveAt) : "never"}</p></div>
            <div className="flex items-center gap-2">{u.blocked && <Badge tone="hard">Blocked</Badge>}<Button onClick={() => setOpen(true)}><Gift className="h-4 w-4" />Assign access</Button></div></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"><Stat label="Solved" value={u.solved} /><Stat label="Streak" value={`${u.streak}d`} /><Stat label="Notes written" value={u.notesWritten} /><Stat label="Bookmarks" value={u.bookmarks} /><Stat label="Revision" value={u.revision} /><Stat label="Study time" value={fmtDuration(u.studyMinutes)} /></div>
          <Card className="p-5"><Heatmap data={u.contributions} /></Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="divide-y divide-line"><p className="p-4 font-bold">Content viewed</p>{u.contentViewed.map((c, i) => <div key={i} className="flex justify-between px-4 py-2.5 text-sm"><span>{c.title} <span className="text-faint">· {c.kind}</span></span><span className="text-xs text-faint">{timeAgo(c.at)}</span></div>)}{!u.contentViewed.length && <p className="p-4 text-sm text-muted">Nothing yet.</p>}</Card>
            <Card className="divide-y divide-line"><p className="p-4 font-bold">Purchases & access</p>
              {u.purchases.map((p) => <div key={p.id} className="flex justify-between px-4 py-2.5 text-sm"><span>{p.title}</span><span className="text-muted">₹{p.amount} · {p.status}</span></div>)}
              {u.entitlements.map((e) => <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm"><span>{e.title} <Badge tone={e.type === "PREMIUM" ? "premium" : "brand"}>{e.type === "PREMIUM" ? "Premium (granted)" : "Free (granted)"}</Badge></span><Button size="sm" variant="ghost" onClick={() => revoke.mutate(e.id)}>Revoke</Button></div>)}
              {!u.purchases.length && !u.entitlements.length && <p className="p-4 text-sm text-muted">No purchases or granted access.</p>}</Card>
          </div>
        </>)}
      </Async>
      <Modal open={open} onClose={() => setOpen(false)} title="Assign access"><div className="space-y-4">
        <Field label="Content type"><Select value={kind} onChange={(e) => { setKind(e.target.value); setTarget(""); }}><option value="note">Notes</option><option value="roadmap">Roadmap</option><option value="cheat-sheet">Cheat sheet</option><option value="problem">DSA problem</option></Select></Field>
        <Field label="Content"><Select value={target} onChange={(e) => setTarget(e.target.value)}><option value="">Select…</option>{list.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</Select></Field>
        <Field label="Access type"><Select value={type} onChange={(e) => setType(e.target.value)}><option value="FREE">Free (gift)</option><option value="PREMIUM">Premium (mark as purchased)</option></Select></Field>
        <div className="flex justify-end"><Button disabled={!target} loading={grant.isPending} onClick={() => grant.mutate({ kind, contentId: target, type })}>Grant access</Button></div></div></Modal>
    </>
  );
}
