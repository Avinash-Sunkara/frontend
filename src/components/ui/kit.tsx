"use client";
import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Inbox, Loader2, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

/* ---------- Button ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"; size?: "sm" | "md" | "lg" | "icon"; loading?: boolean;
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(({ className, variant = "primary", size = "md", loading, disabled, children, ...p }, ref) => (
  <button ref={ref} disabled={disabled || loading} className={cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 active:scale-[.98]",
    size === "sm" && "min-h-9 px-3 text-xs", size === "md" && "min-h-11 px-4 text-sm", size === "lg" && "min-h-12 px-6 text-sm", size === "icon" && "h-10 w-10",
    variant === "primary" && "bg-brand text-brand-ink hover:bg-brand/90",
    variant === "secondary" && "bg-raised text-fg hover:bg-line",
    variant === "outline" && "border border-line bg-surface text-fg hover:bg-raised",
    variant === "ghost" && "text-muted hover:bg-raised hover:text-fg",
    variant === "danger" && "bg-hard/10 text-hard hover:bg-hard/20",
    className)} {...p}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}
  </button>
));
Button.displayName = "Button";

export function LinkButton({ href, className, variant = "primary", size = "md", external, children }: { href: string; className?: string; variant?: BtnProps["variant"]; size?: BtnProps["size"]; external?: boolean; children: React.ReactNode }) {
  const cls = cn("inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
    size === "sm" && "h-8 px-3 text-xs", size === "md" && "h-10 px-4 text-sm", size === "lg" && "h-12 px-6 text-sm",
    variant === "primary" && "bg-brand text-brand-ink hover:bg-brand/90", variant === "secondary" && "bg-raised hover:bg-line",
    variant === "outline" && "border border-line bg-surface hover:bg-raised", variant === "ghost" && "text-muted hover:text-fg", className);
  return external ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a> : <Link href={href} className={cls}>{children}</Link>;
}

/* ---------- Fields ---------- */
const field = "w-full rounded-xl border border-line bg-surface text-sm text-fg placeholder:text-faint transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50";
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; right?: React.ReactNode; invalid?: boolean }>(
  ({ className, icon, right, invalid, ...p }, ref) => (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      <input ref={ref} aria-invalid={invalid} className={cn(field, "h-11", icon ? "pl-10" : "pl-3.5", right ? "pr-11" : "pr-3.5", invalid && "border-hard/60", className)} {...p} />
      {right && <span className="absolute right-2 top-1/2 -translate-y-1/2">{right}</span>}
    </div>
  ));
Input.displayName = "Input";
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(field, "min-h-[96px] p-3.5", className)} {...p} />));
Textarea.displayName = "Textarea";
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(field, "h-11 appearance-none px-3.5 pr-9", className)} {...p}>{children}</select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
  </div>));
Select.displayName = "Select";
export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-muted">{label}</span>{children}
      {hint && !error && <span className="block text-xs text-faint">{hint}</span>}
      {error && <span role="alert" className="block text-xs text-hard">{error}</span>}
    </label>
  );
}

/* ---------- Surface ---------- */
export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-2xl border border-line bg-surface shadow-card sm:rounded-3xl", className)} {...p} />);
export const Badge = ({ className, tone = "neutral", ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "brand" | "easy" | "medium" | "hard" | "premium" }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
    tone === "neutral" && "bg-raised text-muted", tone === "brand" && "bg-brand/10 text-brand", tone === "easy" && "bg-easy/10 text-easy",
    tone === "medium" && "bg-medium/10 text-medium", tone === "hard" && "bg-hard/10 text-hard", tone === "premium" && "bg-medium/15 text-medium", className)} {...p} />);
export const Chip = ({ active, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) => (
  <button className={cn("min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    active ? "border-[#172338] bg-[#172338] text-white hover:bg-[#223653]" : "border-line bg-surface text-muted hover:border-faint hover:bg-raised hover:text-fg", className)} {...p} />);

export function Progress({ value, className, tone }: { value: number; className?: string; tone?: "easy" | "medium" | "hard" }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-raised", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", tone === "medium" ? "bg-medium" : tone === "hard" ? "bg-hard" : tone === "easy" ? "bg-easy" : "bg-brand")} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
export function Ring({ value, size = 72, stroke = 7, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-raised" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className="stroke-brand transition-[stroke-dashoffset] duration-700"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, value) / 100)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/* ---------- States ---------- */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden rounded-xl bg-raised", className)}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-fg/5 to-transparent" />
  </div>);
export const ListSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>);
export function Empty({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <Inbox className="mb-3 h-8 w-8 text-faint" /><p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}{action && <div className="mt-4">{action}</div>}
    </div>);
}
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  const status = (error as any)?.status;
  const msg = (error as Error)?.message || "Something went wrong.";
  return (
    <div className="grid place-items-center rounded-2xl border border-hard/20 bg-hard/5 px-6 py-12 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-hard" />
      <p className="font-semibold">{status === 403 ? "Access restricted" : status === 404 ? "Not found" : "Couldn't load this"}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{msg}</p>
      {retry && status !== 403 && status !== 404 && <Button variant="outline" size="sm" className="mt-4" onClick={retry}>Try again</Button>}
    </div>);
}
/** Renders loading / error / empty / data in one place */
export function Async<T>({ q, children, skeleton, isEmpty, empty }: {
  q: { data?: T; isLoading: boolean; error: unknown; refetch: () => unknown };
  children: (d: T) => React.ReactNode; skeleton?: React.ReactNode; isEmpty?: (d: T) => boolean; empty?: React.ReactNode;
}) {
  if (q.isLoading) return <>{skeleton ?? <ListSkeleton />}</>;
  if (q.error) return <ErrorState error={q.error} retry={() => q.refetch()} />;
  if (!q.data) return null;
  if (isEmpty?.(q.data)) return <>{empty ?? <Empty title="Nothing here yet" />}</>;
  return <>{children(q.data)}</>;
}

/* ---------- Overlays ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-end bg-black/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
            className={cn("max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-6", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-raised hover:text-fg"><X className="h-5 w-5" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function Confirm({ open, onClose, onConfirm, title, body, label = "Confirm", loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; body?: string; label?: string; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {body && <p className="text-sm text-muted">{body}</p>}
      <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" loading={loading} onClick={onConfirm}>{label}</Button></div>
    </Modal>);
}

/* ---------- Tabs / Switch ---------- */
export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: { id: T; label: React.ReactNode }[]; className?: string }) {
  return (
    <div role="tablist" className={cn("inline-flex gap-1 rounded-2xl border border-line bg-surface p-1", className)}>
      {items.map((i) => (
        <button key={i.id} role="tab" aria-selected={value === i.id} onClick={() => onChange(i.id)}
          className={cn("min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition-colors", value === i.id ? "bg-[#172338] text-white" : "text-muted hover:bg-raised hover:text-fg")}>{i.label}</button>))}
    </div>);
}
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-brand" : "bg-line")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", checked ? "left-[22px]" : "left-0.5")} /></button>);
}
export function useDebounced<T>(v: T, ms = 300) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-bold", className)}>
      <Image src="/icon.png" alt="" width={40} height={40} className="h-9 w-9 shrink-0 rounded-xl object-cover" />
      <span className="text-lg tracking-tight">{BRAND.parts[0]}{BRAND.parts[1] && <span className="text-brand">{BRAND.parts[1]}</span>}</span>
    </Link>);
}
