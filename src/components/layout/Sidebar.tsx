"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LogOut, ShieldCheck } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { Logo } from "@/components/ui/kit";
import { NAV } from "./nav";

export function NavItems({ onNavigate, expanded }: { onNavigate?: () => void; expanded?: boolean }) {
  const path = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-2" aria-label="Main">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link key={href} href={href} onClick={onNavigate} title={label} aria-current={active ? "page" : undefined}
            className={cn("group relative flex min-h-11 items-center gap-3 rounded-xl border border-transparent transition-colors",
              expanded ? "px-3 py-2.5" : "mx-auto h-11 w-11 justify-center",
              active ? "border-brand/25 bg-brand/15 text-brand" : "text-muted hover:bg-raised hover:text-fg")}>
            {active && <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-brand" />}
            <Icon className="h-[22px] w-[22px] shrink-0 pointer-events-none" />
            {expanded ? <span className="text-sm font-medium">{label}</span>
              : <span className="pointer-events-none absolute left-14 z-50 hidden whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg shadow-lg group-hover:block group-focus-visible:block">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarFooter({ expanded }: { expanded?: boolean }) {
  const { user, logout } = useAuth();
  return (
    <div className={cn("flex flex-col gap-2 pt-2", !expanded && "items-center")}>
      <Link href="/activity" title="Current streak" className="flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-sm font-bold text-medium">
        <Flame className="pointer-events-none h-4 w-4 shrink-0 fill-medium" />{user?.streak ?? 0}{expanded && <span className="text-xs font-medium text-muted">day streak</span>}
      </Link>
      <div className={cn("flex gap-2", !expanded && "flex-col")}>
        <button onClick={logout} aria-label="Log out" title="Log out" className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:text-hard">
          <LogOut className="pointer-events-none h-4 w-4" />
        </button>
      </div>
      {user?.role === "ADMIN" && (
        <Link href="/admin" title="Admin" className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:text-brand"><ShieldCheck className="pointer-events-none h-4 w-4" /></Link>
      )}
      <Link href="/profile" title={user?.fullName} className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-emerald-700 text-sm font-bold text-white ring-2 ring-brand/30">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="pointer-events-none h-full w-full object-cover" /> : initials(user?.fullName)}
      </Link>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="glass sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center border-r border-line px-3 py-4 lg:flex">
      <Logo className="[&>span:last-child]:hidden" /><NavItems /><SidebarFooter />
    </aside>
  );
}
