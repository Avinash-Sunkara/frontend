"use client";
import { Tabs } from "@/components/ui/kit";
import { useState } from "react";
export const AdminTitle = ({ title, sub }: { title: string; sub?: string }) => (<div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>);
export function TabbedAdmin({ tabs }: { tabs: { id: string; label: string; node: React.ReactNode }[] }) {
  const [t, setT] = useState(tabs[0].id);
  return (<div className="space-y-5"><Tabs value={t} onChange={setT} items={tabs.map((x) => ({ id: x.id, label: x.label }))} className="max-w-full overflow-x-auto" />{tabs.find((x) => x.id === t)?.node}</div>);
}
