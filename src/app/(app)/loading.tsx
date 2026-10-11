import { Skeleton } from "@/components/ui/kit";
export default function Loading() {
  return <div className="space-y-4" aria-busy="true" aria-label="Loading"><Skeleton className="h-12 w-72" /><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;
}
