"use client";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge, Button, Card, Confirm, Empty, Field, Input, ListSkeleton, Modal, Select, Switch, Textarea, useDebounced } from "@/components/ui/kit";
import { useAction, useGet, usePaged } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

export type FieldDef = {
  name: string; label: string; hint?: string; required?: boolean;
  type?: "text" | "textarea" | "number" | "url" | "select" | "multiselect" | "file" | "switch" | "tags" | "emails" | "access" | "html";
  options?: { value: string; label: string }[]; optionsEndpoint?: string; optionLabel?: string; accept?: string; multiple?: boolean;
  showIf?: (v: Record<string, any>) => boolean; half?: boolean;
};
export type Column<T> = { key: string; label: string; render?: (r: T) => React.ReactNode; className?: string };
export const ACCESS_OPTIONS = [
  { value: "FREE", label: "Free for everyone" }, { value: "PREMIUM", label: "Premium" }, { value: "PRIVATE", label: "Free only for selected email addresses" },
];
export const accessFields: FieldDef[] = [
  { name: "access", label: "Access", type: "select", options: ACCESS_OPTIONS, half: true },
  { name: "price", label: "Price (₹)", type: "number", half: true, showIf: (v) => v.access === "PREMIUM" },
  { name: "allowedEmails", label: "Allowed email addresses", type: "emails", hint: "Comma or newline separated", showIf: (v) => v.access === "PRIVATE" },
];

export const selectedOnlyFields: FieldDef[] = [
  { name: "access", label: "Access", type: "select", options: ACCESS_OPTIONS.filter((o) => o.value !== "PREMIUM"), half: true },
  { name: "allowedEmails", label: "Allowed email addresses", type: "emails", hint: "Comma or newline separated", showIf: (v) => v.access === "PRIVATE" },
];

function OptionsSelect({ f, value, onChange }: { f: FieldDef; value: any; onChange: (v: any) => void }) {
  const q = useGet<any[]>(f.optionsEndpoint ?? null, { pageSize: 200 }, { staleTime: 60_000 });
  const raw = q.data as any; const list: any[] = Array.isArray(raw) ? raw : raw?.items ?? [];
  const lab = (o: any) => o[f.optionLabel ?? "title"] ?? o.name ?? o.id;
  if (f.type === "multiselect") {
    const sel: string[] = value ?? [];
    return (<div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-line p-2">
      {list.map((o) => { const on = sel.includes(o.id); return <button type="button" key={o.id} onClick={() => onChange(on ? sel.filter((x) => x !== o.id) : [...sel, o.id])} className={cn("rounded-full border px-3 py-1 text-xs", on ? "border-brand/50 bg-brand/10 text-brand" : "border-line text-muted")}>{lab(o)}</button>; })}
      {!list.length && <span className="p-1 text-xs text-faint">{q.isLoading ? "Loading…" : "No options yet"}</span>}</div>);
  }
  return <Select value={value ?? ""} onChange={(e) => onChange(e.target.value)}><option value="">— none —</option>{list.map((o) => <option key={o.id} value={o.id}>{lab(o)}</option>)}</Select>;
}

function FieldInput({ f, v, set }: { f: FieldDef; v: Record<string, any>; set: (k: string, x: any) => void }) {
  const val = v[f.name];
  switch (f.type) {
    case "textarea": case "html": return <Textarea rows={f.type === "html" ? 10 : 4} value={val ?? ""} onChange={(e) => set(f.name, e.target.value)} className={f.type === "html" ? "font-mono text-xs" : ""} />;
    case "number": return <Input type="number" min={0} value={val ?? ""} onChange={(e) => set(f.name, e.target.value === "" ? undefined : +e.target.value)} />;
    case "url": return <Input type="url" placeholder="https://" value={val ?? ""} onChange={(e) => set(f.name, e.target.value)} />;
    case "select": case "access": return <Select value={val ?? ""} onChange={(e) => set(f.name, e.target.value)}>{!f.required && <option value="">—</option>}{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>;
    case "multiselect": return f.optionsEndpoint ? <OptionsSelect f={f} value={val} onChange={(x) => set(f.name, x)} /> : null;
    case "file": return <input type="file" accept={f.accept} multiple={f.multiple} onChange={(e) => set(f.name, f.multiple ? Array.from(e.target.files ?? []) : e.target.files?.[0])} className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-raised file:px-3 file:py-2 file:text-sm file:font-semibold file:text-fg" />;
    case "switch": return <Switch checked={!!val} onChange={(x) => set(f.name, x)} label={f.label} />;
    case "tags": return <Input placeholder="comma, separated" value={Array.isArray(val) ? val.join(", ") : val ?? ""} onChange={(e) => set(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />;
    case "emails": return <Textarea rows={3} value={Array.isArray(val) ? val.join("\n") : val ?? ""} onChange={(e) => set(f.name, e.target.value.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))} />;
    default: return f.optionsEndpoint ? <OptionsSelect f={f} value={val} onChange={(x) => set(f.name, x)} /> : <Input value={val ?? ""} onChange={(e) => set(f.name, e.target.value)} />;
  }
}

function toBody(fields: FieldDef[], v: Record<string, any>, extra?: Record<string, any>) {
  const hasFile = fields.some((f) => f.type === "file" && v[f.name]);
  const merged = { ...extra, ...v };
  if (!hasFile) { const o: any = {}; fields.forEach((f) => { if (f.type !== "file" && v[f.name] !== undefined && (!f.showIf || f.showIf(v))) o[f.name] = v[f.name]; }); return { ...extra, ...o }; }
  const fd = new FormData();
  Object.entries(merged).forEach(([k, x]) => {
    const def = fields.find((f) => f.name === k);
    if (x === undefined || x === null || (def?.showIf && !def.showIf(v))) return;
    if (x instanceof File) fd.append(k, x);
    else if (Array.isArray(x)) {
      if (x.length === 0) fd.append(k, "");
      else x.forEach((i) => (i instanceof File ? fd.append(k, i) : fd.append(k, String(i))));
    } else fd.append(k, String(x));
  });
  return fd;
}

export interface RMProps<T extends { id: string }> {
  title: string; endpoint: string; columns: Column<T>[]; fields: FieldDef[];
  query?: Record<string, unknown>;            // fixed filters (e.g. parent id)
  createDefaults?: Record<string, any>;       // values merged into new records (e.g. parentId)
  searchable?: boolean; publishable?: boolean; orderable?: boolean; canCreate?: boolean; canDelete?: boolean;
  rowActions?: (r: T, reload: () => void) => React.ReactNode; wide?: boolean; emptyHint?: string;
}

/** Generic admin CRUD: paged list (table ≥ md, cards on mobile) + create/edit modal + delete confirm + publish toggle + reorder. */
export function ResourceManager<T extends { id: string; published?: boolean }>(p: RMProps<T>) {
  const qc = useQueryClient();
  const [q, setQ] = useState(""); const dq = useDebounced(q, 300);
  const list = usePaged<T>(p.endpoint, { ...p.query, q: dq }, 20);
  const rows = useMemo(() => list.data?.pages.flatMap((x) => x.items) ?? [], [list.data]);
  const [edit, setEdit] = useState<T | "new" | null>(null); const [del, setDel] = useState<T | null>(null);
  const [v, setV] = useState<Record<string, any>>({});
  const reload = () => list.refetch();
  const invalidateUserData = () => { void qc.invalidateQueries(); };
  const open = (r: T | "new") => { setV(r === "new" ? { ...p.createDefaults } : { ...(r as any), ...Object.fromEntries(p.fields.filter((f) => f.type === "file").map((f) => [f.name, undefined])) }); setEdit(r); };
  const save = useAction<FormData | Record<string, any>, void>(edit === "new" ? "post" : "put", edit && edit !== "new" ? `${p.endpoint}/${edit.id}` : p.endpoint, { success: "Saved", onSuccess: () => { setEdit(null); reload(); invalidateUserData(); } });
  const remove = useAction<void, void>("delete", del ? `${p.endpoint}/${del.id}` : p.endpoint, { success: "Deleted", onSuccess: () => { setDel(null); reload(); invalidateUserData(); } });
  const pub = useAction<{ id: string; published: boolean }, void>("patch", (b) => `${p.endpoint}/${b.id}/publish`, { onSuccess: () => { reload(); invalidateUserData(); } });
  const move = useAction<{ id: string; direction: "up" | "down" }, void>("patch", (b) => `${p.endpoint}/${b.id}/reorder`, { onSuccess: () => { reload(); invalidateUserData(); } });
  const missing = p.fields.some((f) => f.required && (!f.showIf || f.showIf(v)) && (v[f.name] === undefined || v[f.name] === "" || (Array.isArray(v[f.name]) && !v[f.name].length)) && !(f.type === "file" && edit !== "new"));
  const missingFields = p.fields.filter((f) => f.required && (!f.showIf || f.showIf(v)) && (v[f.name] === undefined || v[f.name] === "" || (Array.isArray(v[f.name]) && !v[f.name].length)) && !(f.type === "file" && edit !== "new"));

  const actions = (r: T, i: number) => (
    <div className="flex items-center justify-end gap-1">
      {p.rowActions?.(r, reload)}
      {p.orderable && (<><Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => move.mutate({ id: r.id, direction: "up" })}><ArrowUp className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move.mutate({ id: r.id, direction: "down" })}><ArrowDown className="h-4 w-4" /></Button></>)}
      {p.publishable && <Button variant="ghost" size="icon" aria-label={r.published ? "Unpublish" : "Publish"} title={r.published ? "Unpublish" : "Publish"} onClick={() => pub.mutate({ id: r.id, published: !r.published })}>{r.published ? <Eye className="h-4 w-4 text-brand" /> : <EyeOff className="h-4 w-4" />}</Button>}
      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => open(r)}><Pencil className="h-4 w-4" /></Button>
      {p.canDelete !== false && <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDel(r)}><Trash2 className="h-4 w-4 text-hard" /></Button>}
    </div>);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {p.searchable !== false && <div className="relative min-w-[200px] flex-1 sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${p.title.toLowerCase()}…`} aria-label={`Search ${p.title}`} className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm focus:border-brand/60 focus:outline-none" /></div>}
        <span className="text-sm text-muted">{list.data?.pages[0]?.total ?? 0} total</span>
        {p.canCreate !== false && <Button className="ml-auto" onClick={() => open("new")}><Plus className="h-4 w-4" />New {p.title.replace(/s$/, "")}</Button>}
      </div>

      {list.isLoading ? <ListSkeleton /> : list.error ? <p className="text-sm text-hard">{(list.error as Error).message}</p> : rows.length === 0 ? <Empty title={`No ${p.title.toLowerCase()} yet`} hint={p.emptyHint} /> : (<>
        <Card className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead><tr className="border-b border-line text-left text-xs text-muted">{p.columns.map((c) => <th key={c.key} className={cn("px-4 py-3 font-semibold", c.className)}>{c.label}</th>)}<th className="px-4 py-3" /></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={r.id} className="border-b border-line last:border-0 hover:bg-raised/40">{p.columns.map((c) => <td key={c.key} className={cn("px-4 py-3", c.className)}>{c.render ? c.render(r) : String((r as any)[c.key] ?? "")}</td>)}<td className="px-4 py-2">{actions(r, i)}</td></tr>)}</tbody></table></Card>
        <div className="space-y-3 md:hidden">{rows.map((r, i) => <Card key={r.id} className="space-y-2 p-4">{p.columns.map((c) => <div key={c.key} className="flex justify-between gap-3 text-sm"><span className="text-muted">{c.label}</span><span className="text-right">{c.render ? c.render(r) : String((r as any)[c.key] ?? "")}</span></div>)}<div className="border-t border-line pt-2">{actions(r, i)}</div></Card>)}</div>
        {list.hasNextPage && <div className="text-center"><Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>Load more</Button></div>}
      </>)}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit === "new" ? `New ${p.title.replace(/s$/, "")}` : `Edit ${p.title.replace(/s$/, "")}`} wide={p.wide ?? true}>
        <div className="grid gap-4 sm:grid-cols-2">
          {p.fields.filter((f) => !f.showIf || f.showIf(v)).map((f) => (
            <div key={f.name} className={cn(!f.half && "sm:col-span-2")}>
              {f.type === "switch" ? <div className="flex items-center justify-between rounded-xl border border-line p-3"><span className="text-sm font-medium">{f.label}</span><FieldInput f={f} v={v} set={(k, x) => setV((o) => ({ ...o, [k]: x }))} /></div>
                : <Field label={f.label + (f.required ? " *" : "")} hint={f.hint}><FieldInput f={f} v={v} set={(k, x) => setV((o) => ({ ...o, [k]: x }))} /></Field>}
            </div>))}
        </div>
        {save.error && <p role="alert" className="mt-4 rounded-xl border border-hard/30 bg-hard/10 px-3 py-2 text-sm text-hard">Couldn&apos;t save this {p.title.replace(/s$/, "").toLowerCase()}: {save.error.message}</p>}
        <div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
          <div className="flex flex-col items-end gap-1"><Button disabled={missing} loading={save.isPending} onClick={() => save.mutate(toBody(p.fields, v, p.createDefaults) as any)}>Save</Button>
            {missing && <span className="text-xs text-medium">Required: {missingFields.map((f) => f.label).join(", ")}</span>}</div></div>
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => remove.mutate(undefined as never)} loading={remove.isPending} title="Delete this item?" body="This can't be undone. Related user progress may also be removed." label="Delete" />
    </div>
  );
}
export const PublishedBadge = ({ r }: { r: { published?: boolean } }) => <Badge tone={r.published ? "brand" : "neutral"}>{r.published ? "Published" : "Draft"}</Badge>;
export const AccessCell = ({ r }: { r: { access?: string; price?: number } }) => <Badge tone={r.access === "PREMIUM" ? "premium" : r.access === "PRIVATE" ? "neutral" : "brand"}>{r.access === "PREMIUM" ? `Premium${r.price ? ` ₹${r.price}` : ""}` : r.access === "PRIVATE" ? "Selected emails" : "Free"}</Badge>;
