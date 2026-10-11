"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { AdminTitle } from "@/components/admin/bits";
import { Badge, Button, Card, Empty, ListSkeleton, Select } from "@/components/ui/kit";
import { useAction, usePaged } from "@/hooks/useApi";
import { fmtInr, timeAgo } from "@/lib/utils";

interface P { id: string; user: string; email: string; title: string; kind: string; amount: number; status: string; reference: string; provider: string; at: string }
export default function Page() {
  const [status, setStatus] = useState("MANUAL_REVIEW");
  const list = usePaged<P>("/admin/payments", { status }, 20);
  const rows = list.data?.pages.flatMap((p) => p.items) ?? [];
  const approve = useAction<{ id: string }, void>("post", (b) => `/admin/payments/${b.id}/approve`, { success: "Approved — access granted", onSuccess: () => list.refetch() });
  const reject = useAction<{ id: string }, void>("post", (b) => `/admin/payments/${b.id}/reject`, { success: "Rejected", onSuccess: () => list.refetch() });
  return (<>
    <AdminTitle title="Payments" sub="Check each UPI transaction ID against your bank statement before approving. Opening a UPI link never unlocks content on its own." />
    <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="h-10 w-56">
      <option value="MANUAL_REVIEW">Awaiting review</option><option value="PENDING">Started, no reference yet</option><option value="SUCCESS">Approved / paid</option><option value="FAILED">Rejected / failed</option><option value="ALL">All</option></Select>
    {list.isLoading ? <ListSkeleton /> : list.error ? <p className="text-hard">{(list.error as Error).message}</p> : !rows.length ? <Empty title="Nothing here" /> : (
      <div className="space-y-3">{rows.map((p) => (
        <Card key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
          <div className="min-w-[220px] flex-1"><p className="font-semibold">{p.title} <span className="text-sm font-normal text-faint">· {p.kind}</span></p><p className="text-sm text-muted">{p.user} · {p.email}</p></div>
          <div className="text-sm"><b>{fmtInr(p.amount)}</b>{p.reference && <span className="ml-2 font-mono text-xs text-muted">UTR {p.reference}</span>}</div>
          <div className="flex items-center gap-2"><Badge tone={p.status === "SUCCESS" ? "brand" : p.status === "FAILED" ? "hard" : "medium"}>{p.status.replace("_", " ")}</Badge><span className="text-xs text-faint">{timeAgo(p.at)}</span></div>
          {p.status === "MANUAL_REVIEW" && <div className="ml-auto flex gap-1">
            <Button size="sm" loading={approve.isPending} onClick={() => approve.mutate({ id: p.id })}><Check className="h-3.5 w-3.5" />Approve</Button>
            <Button size="sm" variant="ghost" loading={reject.isPending} onClick={() => reject.mutate({ id: p.id })}><X className="h-3.5 w-3.5 text-hard" />Reject</Button></div>}
        </Card>))}
        {list.hasNextPage && <div className="text-center"><Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>Load more</Button></div>}</div>)}
  </>);
}
