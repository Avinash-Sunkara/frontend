import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/kit";
import { AccessBadge } from "./bits";
import { cn } from "@/lib/utils";

export function ContentCard({ href, title, description, category, previewUrl, access, price, locked, meta }: {
  href: string; title: string; description?: string; category?: string; previewUrl?: string; access: string; price?: number; locked?: boolean; meta?: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full overflow-hidden transition-colors group-hover:border-brand/40">
        <div className="relative aspect-[16/9] bg-raised">
          {previewUrl && <Image src={previewUrl} alt="" fill sizes="(min-width:1280px) 33vw, (min-width:640px) 50vw, 100vw" className={cn("object-cover", locked && "blur-[2px] brightness-75")} />}
          {locked && <span className="absolute inset-0 grid place-items-center"><span className="grid h-11 w-11 place-items-center rounded-full bg-bg/80 text-medium"><Lock className="h-5 w-5" /></span></span>}
          <span className="absolute right-3 top-3"><AccessBadge access={access} price={price} /></span>
        </div>
        <div className="space-y-1.5 p-4">
          {category && <p className="text-xs font-bold text-brand">{category}</p>}
          <h3 className="font-bold leading-snug">{title}</h3>
          {description && <p className="line-clamp-2 text-sm text-muted">{description}</p>}
          {meta && <p className="pt-1 text-xs text-faint">{meta}</p>}
        </div>
      </Card>
    </Link>
  );
}
