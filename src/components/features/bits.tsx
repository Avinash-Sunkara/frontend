"use client";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { Card, Badge } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, accent, sub, right }: { eyebrow?: string; title: string; accent?: string; sub?: string; right?: React.ReactNode }) {
  return (
    <header className="hero-glow mb-6 flex flex-wrap items-end justify-between gap-4 rounded-3xl py-2">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-1 text-sm font-semibold text-brand">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{title}{accent && <> <span className="text-brand">{accent}</span></>}</h1>
        {sub && <p className="mt-3 text-muted">{sub}</p>}
      </div>{right}
    </header>);
}
export function Stat({ label, value, sub, icon }: { label: string; value: React.ReactNode; sub?: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-4"><div className="flex items-center justify-between text-muted"><span className="text-sm">{label}</span>{icon}</div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>{sub && <p className="text-xs text-faint">{sub}</p>}</Card>);
}
export function Section({ title, href, children, className }: { title: string; href?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2>
        {href && <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">View all <ArrowRight className="h-3.5 w-3.5" /></Link>}</div>
      {children}
    </section>);
}
export const AccessBadge = ({ access, price }: { access: string; price?: number }) =>
  access === "PREMIUM" ? <Badge tone="premium"><Crown className="h-3 w-3" />{price ? `₹${price}` : "Premium"}</Badge> : access === "PRIVATE" ? <Badge>Private</Badge> : <Badge tone="brand">Free</Badge>;
