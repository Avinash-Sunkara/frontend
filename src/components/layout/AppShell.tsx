"use client";
import { useAuth } from "@/providers/auth";
import { Skeleton } from "@/components/ui/kit";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import GlobalSearch from "./GlobalSearch";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || !user) return <div className="grid min-h-dvh place-items-center"><Skeleton className="h-10 w-40" /></div>;
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
