"use client";
import { useState } from "react";
import { Async, Card, Select, Skeleton } from "@/components/ui/kit";
import { AdminTitle } from "@/components/admin/bits";
import { Stat } from "@/components/features/bits";
import { useGet } from "@/hooks/useApi";

interface A { signups: { label: string; value: number }[]; activeUsers: { label: string; value: number }[]; revenue: { label: string; value: number }[]; topProblems: { title: string; solves: number }[]; topContent: { title: string; views: number }[]; totals: { revenue: number; conversion: number } }
function Bars({ data, fmt = (n: number) => String(n) }: { data: { label: string; value: number }[]; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Bar chart">{data.map((d) => (
    <div key={d.label} className="group relative flex flex-1 flex-col items-center justify-end gap-1"><span className="absolute -top-6 hidden whitespace-nowrap rounded bg-raised px-1.5 py-0.5 text-[10px] group-hover:block">{fmt(d.value)}</span>
      <div className="w-full rounded-t-md bg-brand/70 transition-colors group-hover:bg-brand" style={{ height: `${(d.value / max) * 100}%`, minHeight: 2 }} /><span className="text-[10px] text-faint">{d.label}</span></div>))}</div>;
}
export default function Page() {
  const [range, setRange] = useState("30d");
  const q = useGet<A>("/admin/analytics", { range });
  return (<>
    <div className="flex flex-wrap items-center justify-between gap-3"><AdminTitle title="Analytics" /><Select value={range} onChange={(e) => setRange(e.target.value)} className="h-10 w-40" aria-label="Range"><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></Select></div>
    <Async q={q} skeleton={<Skeleton className="h-96" />}>
      {(d) => (<>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Revenue" value={`₹${d.totals.revenue.toLocaleString("en-IN")}`} /><Stat label="Premium conversion" value={`${d.totals.conversion}%`} /></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5"><p className="mb-6 font-bold">New signups</p><Bars data={d.signups} /></Card><Card className="p-5"><p className="mb-6 font-bold">Active users</p><Bars data={d.activeUsers} /></Card>
          <Card className="p-5 lg:col-span-2"><p className="mb-6 font-bold">Revenue</p><Bars data={d.revenue} fmt={(n) => `₹${n}`} /></Card>
          <Card className="divide-y divide-line"><p className="p-4 font-bold">Most solved problems</p>{d.topProblems.map((p) => <div key={p.title} className="flex justify-between px-4 py-2.5 text-sm"><span>{p.title}</span><span className="text-muted">{p.solves}</span></div>)}</Card>
          <Card className="divide-y divide-line"><p className="p-4 font-bold">Most viewed content</p>{d.topContent.map((p) => <div key={p.title} className="flex justify-between px-4 py-2.5 text-sm"><span>{p.title}</span><span className="text-muted">{p.views}</span></div>)}</Card>
        </div></>)}
    </Async>
  </>);
}
