"use client";
import { useEffect, useState } from "react";
import { Async, Button, Card, Field, Input, Select, Skeleton, Switch } from "@/components/ui/kit";
import { AdminTitle } from "@/components/admin/bits";
import { useAction, useGet } from "@/hooks/useApi";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Textarea } from "@/components/ui/kit";

interface S { siteName: string; supportEmail: string; maintenanceMode: boolean; paymentProvider: string; paymentMode: "GATEWAY" | "MANUAL"; upiDeepLinkTemplate: string; defaultPopupSeconds: number; signupsOpen: boolean }
interface Founder { name: string; title: string; bio: string[]; previously: string[]; stats: { label: string; value: string }[]; ctaLabel?: string; ctaUrl?: string }
function FounderForm() {
  const q = useGet<Founder | null>("/admin/founder");
  const [f, setF] = useState({ name: "", title: "", bio: "", previously: "", stats: "", ctaLabel: "", ctaUrl: "" }); const [photo, setPhoto] = useState<File>();
  useEffect(() => { const d = q.data; if (d) setF({ name: d.name, title: d.title, bio: d.bio.join("\n\n"), previously: d.previously.join(", "), stats: d.stats.map((x) => `${x.value}|${x.label}`).join("\n"), ctaLabel: d.ctaLabel ?? "", ctaUrl: d.ctaUrl ?? "" }); }, [q.data]);
  const save = useAction<FormData, void>("put", "/admin/founder", { success: "About section saved", invalidate: [["/public/founder"]] });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => { const fd = new FormData(); Object.entries(f).forEach(([k, v]) => fd.append(k, v)); if (photo) fd.append("photo", photo); save.mutate(fd); };
  return (
    <Card className="max-w-2xl space-y-4 p-6"><div><h2 className="font-bold">Landing page · About / founder</h2><p className="text-sm text-muted">Leave the name empty to hide the section.</p></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field><Field label="Title"><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></Field></div>
      <Field label="Bio" hint="Separate paragraphs with a blank line"><Textarea rows={6} value={f.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
      <Field label="Previously" hint="Comma separated"><Input value={f.previously} onChange={(e) => set("previously", e.target.value)} /></Field>
      <Field label="Stats" hint="One per line as value|label, e.g. 100+|Mentored 1:1"><Textarea rows={3} value={f.stats} onChange={(e) => set("stats", e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Button label"><Input value={f.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} /></Field><Field label="Button URL"><Input type="url" value={f.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} /></Field></div>
      <Field label="Photo"><input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-raised file:px-3 file:py-2 file:font-semibold file:text-fg" /></Field>
      <div className="flex justify-end"><Button loading={save.isPending} onClick={submit}>Save</Button></div></Card>);
}
export default function Page() {
  const q = useGet<S>("/admin/settings");
  const [s, setS] = useState<S | null>(null);
  useEffect(() => { if (q.data) setS(q.data); }, [q.data]);
  const save = useAction<S, void>("put", "/admin/settings", { success: "Settings saved" });
  const set = (k: keyof S, v: any) => setS((p) => (p ? { ...p, [k]: v } : p));
  return (<>
    <AdminTitle title="Settings" />
    <Async q={q} skeleton={<Skeleton className="h-96" />}>{() => s && (
      <Card className="max-w-2xl space-y-5 p-6">
        <Field label="Site name"><Input value={s.siteName} onChange={(e) => set("siteName", e.target.value)} /></Field>
        <Field label="Support email"><Input type="email" value={s.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} /></Field>
        <Field label="Default popup duration (seconds)"><Input type="number" min={2} max={30} value={s.defaultPopupSeconds} onChange={(e) => set("defaultPopupSeconds", +e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Payment verification"><Select value={s.paymentMode} disabled><option value="GATEWAY">Payment gateway (webhook verified)</option><option value="MANUAL">Manual admin verification</option></Select></Field>
          <Field label="Gateway"><Input value={s.paymentProvider} disabled /></Field></div>
        <Field label="UPI / deep-link template" hint="Read-only: payments are configured with PAYMENT_PROVIDER / UPI_PAYMENT_URL on the backend. A UPI link alone does not prove payment."><Input value={s.upiDeepLinkTemplate} disabled /></Field>
        <div className="flex items-center justify-between rounded-xl border border-line p-3"><span className="text-sm font-medium">Signups open</span><Switch checked={s.signupsOpen} onChange={(v) => set("signupsOpen", v)} label="Signups open" /></div>
        <div className="flex items-center justify-between rounded-xl border border-line p-3"><span className="text-sm font-medium">Maintenance mode</span><Switch checked={s.maintenanceMode} onChange={(v) => set("maintenanceMode", v)} label="Maintenance mode" /></div>
        <div className="flex justify-end"><Button loading={save.isPending} onClick={() => save.mutate(s)}>Save settings</Button></div>
      </Card>)}</Async>
    <FounderForm />
    <div className="space-y-3"><div><h2 className="text-lg font-bold">Testimonials</h2><p className="text-sm text-muted">Shown on the landing page. Only add messages you have permission to publish.</p></div>
      <ResourceManager<any> title="Testimonials" endpoint="/admin/testimonials" publishable orderable
        columns={[{ key: "name", label: "Name" }, { key: "quote", label: "Quote", render: (r) => <span className="line-clamp-1 max-w-md">{r.quote}</span> }, { key: "rating", label: "Rating" }]}
        fields={[{ name: "name", label: "Name", required: true, half: true }, { name: "handle", label: "Handle / location", half: true }, { name: "quote", label: "Quote", type: "textarea", required: true }, { name: "rating", label: "Rating (1–5)", type: "number", half: true }, { name: "avatar", label: "Photo", type: "file", accept: "image/*", half: true }, { name: "published", label: "Published", type: "switch" }]} /></div>
  </>);
}
