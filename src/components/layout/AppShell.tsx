"use client";
import { useAuth } from "@/providers/auth";
import Link from "next/link";
import { Button, Skeleton } from "@/components/ui/kit";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import GlobalSearch from "./GlobalSearch";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, authError, refresh } = useAuth();
  if (loading) return <div className="grid min-h-dvh place-items-center"><Skeleton className="h-10 w-40" /></div>;
  if (authError) return <main className="grid min-h-dvh place-items-center p-6 text-center"><div className="max-w-md space-y-3"><h1 className="text-xl font-bold">We couldn&apos;t verify your session</h1><p className="text-sm text-muted">{authError}</p><div className="flex justify-center gap-3"><Button onClick={() => void refresh()}>Try again</Button><Link href="/login" className="rounded-xl border border-line px-4 py-2 text-sm font-semibold">Sign in</Link></div></div></main>;
  if (!user) return <div className="grid min-h-dvh place-items-center"><Skeleton className="h-10 w-40" /></div>;
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileNav />
        <div className="mx-auto w-full max-w-[1500px] px-4 pb-24 pt-5 sm:px-6 lg:pb-10 lg:pt-6"><GlobalSearch />{children}</div>
      </div>
    </div>
  );
}
