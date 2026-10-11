"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type T = { id: string; title: string; message?: string; type: "info" | "success" | "warning" | "error"; ms: number };
const Ctx = createContext<{ toast: (t: Omit<T, "id" | "ms" | "type"> & { type?: T["type"]; ms?: number }) => void }>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const dismiss = (id: string) => setItems((p) => p.filter((x) => x.id !== id));
  const toast = useCallback<React.ContextType<typeof Ctx>["toast"]>((t) => {
    const id = Math.random().toString(36).slice(2);
    const ms = t.ms ?? 5000;
    setItems((p) => [...p.slice(-2), { id, title: t.title, message: t.message, type: t.type ?? "info", ms }]);
    setTimeout(() => dismiss(id), ms);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  const Icon = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertTriangle };
  return (
    <Ctx.Provider value={value}>
      {children}
      {/* top-centre, non-blocking (pointer-events only on the card itself) */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const I = Icon[t.type];
            return (
              <motion.div key={t.id} layout initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="glass pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-line p-3.5 shadow-2xl shadow-black/40">
                <I className={cn("mt-0.5 h-5 w-5 shrink-0", t.type === "error" ? "text-hard" : t.type === "warning" ? "text-medium" : "text-brand")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-faint hover:text-fg"><X className="h-4 w-4" /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
