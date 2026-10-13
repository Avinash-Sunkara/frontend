"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CreditCard, BarChart3, BellRing, BookOpen, Database, FileText, Calculator, GraduationCap, LayoutDashboard, ListChecks, LogOut, Map, Menu, MessagesSquare, Puzzle, Settings, Users, X, ArrowLeft } from "lucide-react";
import { Logo, Skeleton } from "@/components/ui/kit";
import { ForcePasswordChange } from "@/components/features/ForcePasswordChange";
import { useAuth } from "@/providers/auth";
import { cn } from "@/lib/utils";

const NAV = [
  ["/admin", "Overview", LayoutDashboard], ["/admin/users", "Users", Users], ["/admin/dsa", "DSA", ListChecks], ["/admin/core-cs", "Core CS", Database],
  ["/admin/aptitude", "Aptitude", Calculator], ["/admin/notes", "Notes", BookOpen], ["/admin/roadmaps", "Roadmaps", Map], ["/admin/cheat-sheets", "Cheat sheets", FileText],
  ["/admin/interviews", "Interviews", MessagesSquare], ["/admin/puzzles", "Puzzles", Puzzle], ["/admin/courses", "Courses", GraduationCap], ["/admin/notifications", "Notifications", BellRing], ["/admin/payments", "Payments", CreditCard], ["/admin/analytics", "Analytics", BarChart3], ["/admin/settings", "Settings", Settings],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(); const path = usePathname(); const [open, setOpen] = useState(false);
  if (loading || !user) return <div className="grid min-h-dvh place-items-center"><Skeleton className="h-10 w-40" /></div>;
  if (user.role !== "ADMIN") return <div className="grid min-h-dvh place-items-center text-center"><div><h1 className="text-xl font-bold">Admins only</h1><Link className="mt-3 inline-block text-brand" href="/dashboard">Back to the app</Link></div></div>;
  if (user.mustChangePassword) return <ForcePasswordChange />;
  const links = (
    <nav className="flex flex-col gap-1" aria-label="Admin">{NAV.map(([href, label, I]) => {
      const active = href === "/admin" ? path === href : path.startsWith(href);
      return <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", active ? "bg-brand/15 text-brand" : "text-muted hover:bg-raised hover:text-fg")}><I className="pointer-events-none h-[18px] w-[18px] shrink-0" />{label}</Link>; })}</nav>);
  return (
    <div className="flex min-h-dvh">
      <aside className="glass sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r p-4 lg:flex">
        <div className="flex items-center gap-2"><Logo href="/admin" /><span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand">ADMIN</span></div>{links}
        <div className="mt-auto space-y-1 border-t border-line pt-3 text-sm">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted hover:text-fg"><ArrowLeft className="h-4 w-4" />Back to app</Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-muted hover:text-hard"><LogOut className="h-4 w-4" />Log out</button></div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line px-4 lg:hidden"><Logo href="/admin" /><button aria-label="Menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button></header>
        {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}><aside onClick={(e) => e.stopPropagation()} className="h-full w-72 overflow-y-auto bg-surface p-4"><button aria-label="Close" className="mb-3" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>{links}</aside></div>}
        <main className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
