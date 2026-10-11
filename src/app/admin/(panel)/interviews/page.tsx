"use client";
import { Check, X } from "lucide-react";
import { AdminTitle } from "@/components/admin/bits";
import { PublishedBadge, ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, Button } from "@/components/ui/kit";
import { useAction } from "@/hooks/useApi";

function Mod({ id, reload }: { id: string; reload: () => void }) {
  const m = useAction<{ approved: boolean }, void>("patch", `/admin/interviews/${id}/moderate`, { success: "Updated", onSuccess: reload });
  return <><Button variant="ghost" size="icon" aria-label="Approve" onClick={() => m.mutate({ approved: true })}><Check className="h-4 w-4 text-brand" /></Button><Button variant="ghost" size="icon" aria-label="Reject" onClick={() => m.mutate({ approved: false })}><X className="h-4 w-4 text-hard" /></Button></>;
}
export default function Page() {
  return (<>
    <AdminTitle title="Interview experiences" sub="Review community submissions and publish, edit or remove them." />
    <ResourceManager<any> title="Experiences" endpoint="/admin/interviews" publishable canCreate
      rowActions={(r, reload) => <Mod id={r.id} reload={reload} />}
      columns={[{ key: "title", label: "Title" }, { key: "company", label: "Company" }, { key: "status", label: "Outcome", render: (r) => <Badge tone={r.status === "Selected" ? "brand" : r.status === "Rejected" ? "hard" : "medium"}>{r.status}</Badge> }, { key: "published", label: "Visibility", render: (r) => <PublishedBadge r={r} /> }]}
      fields={[{ name: "company", label: "Company", required: true, half: true }, { name: "role", label: "Role", required: true, half: true }, { name: "level", label: "Experience level", half: true }, { name: "rounds", label: "Rounds", type: "number", half: true },
        { name: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard"].map((v) => ({ value: v, label: v })), half: true }, { name: "status", label: "Outcome", type: "select", options: ["Selected", "Rejected", "Pending"].map((v) => ({ value: v, label: v })), half: true },
        { name: "title", label: "Title", required: true }, { name: "summary", label: "Summary", type: "textarea" }, { name: "background", label: "Background", type: "textarea" }, { name: "body", label: "Round-by-round (HTML)", type: "html" },
        { name: "verdict", label: "Verdict", type: "textarea" }, { name: "tags", label: "Tags", type: "tags" }, { name: "published", label: "Published", type: "switch" }]} />
  </>);
}
