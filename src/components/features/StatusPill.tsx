import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Interview } from "@/lib/types";

export const StatusPill = ({ s }: { s: Interview["status"] }) => {
  const I = s === "Selected" ? CheckCircle2 : s === "Rejected" ? XCircle : Clock;
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", s === "Selected" ? "bg-brand/15 text-brand" : s === "Rejected" ? "bg-hard/15 text-hard" : "bg-medium/15 text-medium")}><I className="h-3.5 w-3.5" />{s}</span>;
};
