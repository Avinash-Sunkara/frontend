"use client";
import { Send } from "lucide-react";
import { AdminTitle } from "@/components/admin/bits";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, Button } from "@/components/ui/kit";
import { useAction } from "@/hooks/useApi";

function Publish({ id, reload }: { id: string; reload: () => void }) {
  const m = useAction<void, void>("post", `/admin/notifications/${id}/publish`, { success: "Published — users will see it on their next visit", onSuccess: reload });
  return <Button variant="outline" size="sm" loading={m.isPending} onClick={() => m.mutate(undefined as never)}><Send className="h-3.5 w-3.5" />Publish</Button>;
}
export default function Page() {
  return (<>
    <AdminTitle title="Popup notifications" sub="Short messages that appear at the top of the screen for about 5 seconds." />
    <ResourceManager<any> title="Notifications" endpoint="/admin/notifications" searchable={false}
      rowActions={(r, reload) => !r.publishedAt ? <Publish id={r.id} reload={reload} /> : null}
      columns={[{ key: "title", label: "Title" }, { key: "target", label: "Target" }, { key: "type", label: "Type", render: (r) => <Badge>{r.type}</Badge> }, { key: "publishedAt", label: "Status", render: (r) => <Badge tone={r.publishedAt ? "brand" : "neutral"}>{r.publishedAt ? "Published" : "Draft"}</Badge> }]}
      fields={[{ name: "title", label: "Title", required: true, hint: "e.g. New DSA Notes Added!" }, { name: "message", label: "Message", type: "textarea" },
        { name: "type", label: "Type", type: "select", options: [{ value: "info", label: "Info" }, { value: "success", label: "Success" }, { value: "warning", label: "Warning" }], half: true }, { name: "durationSeconds", label: "Duration (seconds)", type: "number", half: true, hint: "Default 5" },
        { name: "target", label: "Target", type: "select", required: true, options: [{ value: "ALL", label: "All users" }, { value: "USERS", label: "Selected users" }, { value: "EMAILS", label: "Selected email addresses" }] },
        { name: "userIds", label: "Users", type: "multiselect", optionsEndpoint: "/admin/users", optionLabel: "email", showIf: (v) => v.target === "USERS" }, { name: "emails", label: "Email addresses", type: "emails", showIf: (v) => v.target === "EMAILS" }]} />
  </>);
}
