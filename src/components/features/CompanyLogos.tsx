import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/types";

export function CompanyLogo({ c, size = 28 }: { c: Company; size?: number }) {
  return c.logoUrl
    ? <Image src={c.logoUrl} alt={c.name} title={c.name} width={size} height={size} className="rounded-full border border-line bg-white object-contain p-0.5" style={{ width: size, height: size }} />
    : <span title={c.name} style={{ width: size, height: size }} className="grid place-items-center rounded-full border border-line bg-raised text-[10px] font-bold text-muted">{c.name.slice(0, 2).toUpperCase()}</span>;
}
export function CompanyLogos({ companies, max = 3, size = 28, className }: { companies: Company[]; max?: number; size?: number; className?: string }) {
  if (!companies?.length) return null;
  return (
    <div className={cn("flex -space-x-1.5", className)}>
      {companies.slice(0, max).map((c) => <CompanyLogo key={c.id} c={c} size={size} />)}
      {companies.length > max && <span style={{ width: size, height: size }} className="grid place-items-center rounded-full border border-line bg-raised text-[10px] font-bold text-muted">+{companies.length - max}</span>}
    </div>
  );
}
