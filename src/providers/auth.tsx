"use client";
import { createContext, useCallback, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { get, post } from "@/lib/api";
import type { PopupNotification, User } from "@/lib/types";
import { useToast } from "./toast";

interface AuthCtx { user: User | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> }
const Ctx = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} });
export const useAuth = () => useContext(Ctx);

const PUBLIC = ["/", "/terms", "/privacy", "/login", "/register", "/forgot-password", "/reset-password", "/admin/login", "/auth/callback", "/verify-email"];

const loginFor = (path: string) => (path.startsWith("/admin") ? "/admin/login" : `/login?next=${encodeURIComponent(path)}`);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const router = useRouter();
  const path = usePathname();
  const { toast } = useToast();
  const isPublic = PUBLIC.includes(path);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: () => get<User>("/auth/me").catch(() => null),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const logout = useCallback(async () => {
    try { await post("/auth/logout"); } catch {}
    qc.clear(); await qc.setQueryData(["me"], null); router.replace("/login");
  }, [qc, router]);

  useEffect(() => {
    const onUnauth = () => { qc.setQueryData(["me"], null); const here = window.location.pathname; if (!PUBLIC.includes(here)) router.replace(loginFor(here)); };
    const onErr = (e: Event) => toast({ title: "Request failed", message: (e as CustomEvent).detail, type: "error" });
    window.addEventListener("rb:unauthorized", onUnauth); window.addEventListener("rb:api-error", onErr);
    return () => { window.removeEventListener("rb:unauthorized", onUnauth); window.removeEventListener("rb:api-error", onErr); };
  }, [qc, router, toast]);

  useEffect(() => { if (!isLoading && !user && !isPublic) router.replace(loginFor(path)); }, [isLoading, user, isPublic, path, router]);
  useEffect(() => {
    if (!isLoading && user && user.role !== "ADMIN" && path.startsWith("/admin") && path !== "/admin/login") router.replace("/dashboard");
  }, [isLoading, user, path, router]);

  // Login-time + published popups (backend returns unseen ones and marks them seen on ack)
  useEffect(() => {
    if (!user) return;
    get<PopupNotification[]>("/notifications/popups").then((list) => {
      list.forEach((n, i) => setTimeout(() => {
        toast({ title: n.title, message: n.message, type: n.type === "success" ? "success" : n.type === "warning" ? "warning" : "info", ms: n.durationMs ?? 5000 });
        post(`/notifications/popups/${n.id}/seen`).catch(() => {});
      }, i * 900));
    }).catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Ctx.Provider value={{ user: user ?? null, loading: isLoading, refresh: async () => { await refetch(); }, logout }}>{children}</Ctx.Provider>;
}
