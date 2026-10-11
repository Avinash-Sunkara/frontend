"use client";
import { Async, Card, Skeleton } from "@/components/ui/kit";
import { Stat } from "@/components/features/bits";
import { AdminTitle } from "@/components/admin/bits";
import { useGet } from "@/hooks/useApi";
import { timeAgo } from "@/lib/utils";

interface Ov { totalUsers: number; activeUsers: number; newUsers: number; problems: number; notes: number; roadmaps: number; cheatSheets: number; interviews: number; purchases: number; revenue: number; recent: { id: string; text: string; at: string }[] }
export default function Page() {
  const q = useGet<Ov>("/admin/overview");
  return (
    <>
      <AdminTitle title="Overview" sub="Platform health at a glance." />
      <Async q={q} skeleton={<Skeleton className="h-64" />}>
        {(d) => (<>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Stat label="Total users" value={d.totalUsers.toLocaleString()} /><Stat label="Active users" value={d.activeUsers.toLocaleString()} sub="last 7 days" /><Stat label="New users" value={d.newUsers.toLocaleString()} sub="last 7 days" />
            <Stat label="Problems" value={d.problems} /><Stat label="Notes" value={d.notes} /><Stat label="Roadmaps" value={d.roadmaps} /><Stat label="Cheat sheets" value={d.cheatSheets} />
            <Stat label="Interview experiences" value={d.interviews} /><Stat label="Premium purchases" value={d.purchases} /><Stat label="Revenue" value={`₹${d.revenue.toLocaleString("en-IN")}`} /></div>
          <Card className="divide-y divide-line"><p className="p-4 font-bold">Recent activity</p>
            {d.recent.map((r) => <div key={r.id} className="flex justify-between gap-4 px-4 py-3 text-sm"><span>{r.text}</span><span className="shrink-0 text-xs text-faint">{timeAgo(r.at)}</span></div>)}
            {!d.recent.length && <p className="p-6 text-center text-sm text-muted">Nothing yet.</p>}</Card>
        </>)}
      </Async>
    </>
  );
}
