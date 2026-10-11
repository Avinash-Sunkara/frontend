"use client";
import { useState } from "react";
import Link from "next/link";
import { Ban, CheckCircle2, ExternalLink, Search, Trash2 } from "lucide-react";
import { Badge, Button, Card, Confirm, Empty, ListSkeleton, Select, useDebounced } from "@/components/ui/kit";
import { AdminTitle } from "@/components/admin/bits";
import { useAction, usePaged } from "@/hooks/useApi";
import { timeAgo } from "@/lib/utils";

interface U { id: string; fullName: string; username: string; email: string; role: string; blocked: boolean; premium: boolean; solved: number; streak: number; createdAt: string; lastActiveAt?: string }
export default function Page() {
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const dq = useDebounced(q, 300); const [del, setDel] = useState<U | null>(null);
  const list = usePaged<U>("/admin/users", { q: dq, status }, 25);
  const rows = list.data?.pages.flatMap((p) => p.items) ?? [];
  const block = useAction<{ id: string; blocked: boolean }, void>("patch", (b) => `/admin/users/${b.id}/${b.blocked ? "block" : "unblock"}`, { success: "User updated", onSuccess: () => list.refetch() });
  const remove = useAction<void, void>("delete", del ? `/admin/users/${del.id}` : "/admin/users", { success: "User deleted", onSuccess: () => { setDel(null); list.refetch(); } });
  return (
    <>
      <AdminTitle title="Users" sub="Search, review activity, manage access." />
      <div className="flex flex-wrap gap-3"><div className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, username or email…" aria-label="Search users" className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm focus:outline-none focus:border-brand/60" /></div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="h-10 w-44"><option value="">All users</option><option value="active">Active</option><option value="blocked">Blocked</option><option value="premium">Has premium</option><option value="admin">Admins</option></Select></div>
      {list.isLoading ? <ListSkeleton /> : list.error ? <p className="text-hard">{(list.error as Error).message}</p> : !rows.length ? <Empty title="No users found" /> : (
        <div className="space-y-3">{rows.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
            <div className="min-w-[200px] flex-1"><p className="font-semibold">{u.fullName} <span className="text-sm font-normal text-faint">@{u.username}</span></p><p className="text-sm text-muted">{u.email}</p></div>
            <div className="flex flex-wrap gap-2">{u.blocked && <Badge tone="hard">Blocked</Badge>}{u.premium && <Badge tone="premium">Premium</Badge>}{u.role === "ADMIN" && <Badge tone="brand">Admin</Badge>}</div>
            <div className="text-sm text-muted"><b className="text-fg">{u.solved}</b> solved · <b className="text-fg">{u.streak}</b>d streak</div>
            <div className="text-xs text-faint">Last active {u.lastActiveAt ? timeAgo(u.lastActiveAt) : "never"}</div>
            <div className="ml-auto flex gap-1"><Link href={`/admin/users/${u.id}`}><Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5" />Profile</Button></Link>
              <Button variant="ghost" size="sm" onClick={() => block.mutate({ id: u.id, blocked: !u.blocked })}>{u.blocked ? <><CheckCircle2 className="h-3.5 w-3.5" />Unblock</> : <><Ban className="h-3.5 w-3.5" />Block</>}</Button>
              <Button variant="ghost" size="icon" aria-label="Delete user" onClick={() => setDel(u)}><Trash2 className="h-4 w-4 text-hard" /></Button></div>
          </Card>))}{list.hasNextPage && <div className="text-center"><Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>Load more</Button></div>}</div>)}
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => remove.mutate(undefined as never)} loading={remove.isPending} title={`Delete ${del?.fullName}?`} body="Their progress, notes and activity are removed permanently." label="Delete user" />
    </>
  );
}
