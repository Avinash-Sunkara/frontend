import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
export const fmtInr = (n?: number | null) => (n == null ? "₹XXX" : `₹${n.toLocaleString("en-IN")}`);
export function timeAgo(iso?: string) {
  if (!iso) return "";
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const u: [number, string][] = [[31536000, "year"], [2592000, "month"], [86400, "day"], [3600, "hour"], [60, "minute"]];
  for (const [sec, name] of u) if (s >= sec) { const n = Math.floor(s / sec); return `${n} ${name}${n > 1 ? "s" : ""} ago`; }
  return "just now";
}
export const fmtDuration = (mins = 0) => (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`);
export const initials = (n = "") => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U";
export const diffColor = (d: string) =>
  d === "Easy" ? "text-easy bg-easy/10" : d === "Medium" ? "text-medium bg-medium/10" : "text-hard bg-hard/10";
