"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/kit";
import { NAV } from "./nav";
import { NavItems, SidebarFooter } from "./Sidebar";

const BOTTOM = NAV.slice(0, 5);
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line px-4 shadow-sm lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:bg-raised hover:text-fg"><Search className="h-5 w-5" /></Link>
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:bg-raised hover:text-fg"><Menu className="h-5 w-5" /></button>
        </div>
      </header>
      <nav className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgb(18_34_55_/_0.05)] lg:hidden" aria-label="Quick">
        {BOTTOM.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium", active ? "text-brand" : "text-muted")}>
          <Icon className="pointer-events-none h-5 w-5 shrink-0" />{label.split(" ")[0]}
            </Link>);
        })}
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "tween", duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} className="flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-surface p-4">
              <div className="flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5 text-muted" /></button></div>
              <NavItems expanded onNavigate={() => setOpen(false)} />
              <SidebarFooter expanded />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
