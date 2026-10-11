"use client";
import { useEffect, useState } from "react";
import { Button, Card, Field, Input, Modal } from "@/components/ui/kit";
import { PASSWORD_HINT, passwordProblem } from "@/lib/password";
import { PasswordInput } from "@/components/features/PasswordInput";
import { PageHeader } from "@/components/features/bits";
import { useAction, useGet } from "@/hooks/useApi";
import { useAuth } from "@/providers/auth";
import { initials, timeAgo } from "@/lib/utils";
import { Camera } from "lucide-react";

interface Purchase { id: string; title: string; kind: string; amount: number; status: string; at: string }
export default function Page() {
  const { user, refresh, logout } = useAuth();
  const [name, setName] = useState(""); const [username, setUsername] = useState(""); const [pw, setPw] = useState(false);
  const [cur, setCur] = useState(""); const [next, setNext] = useState("");
  useEffect(() => { if (user) { setName(user.fullName); setUsername(user.username); } }, [user]);
  const purchases = useGet<Purchase[]>("/me/purchases");
  const save = useAction<{ fullName: string; username: string }, void>("patch", "/me", { success: "Profile updated", onSuccess: () => refresh() });
  const avatar = useAction<FormData, void>("post", "/me/avatar", { success: "Photo updated", onSuccess: () => refresh() });
  const onPick = (f?: File) => { if (!f) return; if (f.size > 2 * 1024 * 1024 || !f.type.startsWith("image/")) return alert("Choose an image under 2 MB."); const fd = new FormData(); fd.append("avatar", f); avatar.mutate(fd); };
  const change = useAction<{ currentPassword: string; newPassword: string }, void>("post", "/me/password", { success: "Password changed", onSuccess: () => { setPw(false); setCur(""); setNext(""); } });
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Your" accent="profile" />
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-4"><label className="group relative grid h-16 w-16 cursor-pointer place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-emerald-700 text-xl font-bold text-white" title="Change photo">{user?.avatarUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(user?.fullName)}<span className="absolute inset-0 hidden place-items-center bg-black/50 group-hover:grid"><Camera className="h-5 w-5" /></span><input type="file" accept="image/*" className="sr-only" aria-label="Upload profile photo" onChange={(e) => onPick(e.target.files?.[0])} /></label><div><p className="font-bold">{user?.fullName}</p><p className="text-sm text-muted">{user?.email}</p></div></div>
        <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Username"><Input value={username} onChange={(e) => setUsername(e.target.value)} /></Field>
        <div className="flex justify-between"><Button variant="outline" onClick={() => setPw(true)}>Change password</Button><Button loading={save.isPending} disabled={!name.trim() || username.length < 3} onClick={() => save.mutate({ fullName: name.trim(), username: username.trim() })}>Save changes</Button></div>
      </Card>
      <Card className="p-6"><h2 className="mb-3 font-bold">Purchases</h2>
        {purchases.data?.length ? <div className="divide-y divide-line">{purchases.data.map((p) => <div key={p.id} className="flex justify-between py-3 text-sm"><span>{p.title} <span className="text-faint">· {p.kind}</span></span><span className="text-muted">₹{p.amount} · {p.status} · {timeAgo(p.at)}</span></div>)}</div> : <p className="text-sm text-muted">Nothing purchased yet.</p>}</Card>
      <Button variant="danger" onClick={logout}>Log out</Button>
      <Modal open={pw} onClose={() => setPw(false)} title="Change password"><div className="space-y-4">
        <Field label="Current password"><PasswordInput value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" /></Field>
        <Field label="New password" hint={PASSWORD_HINT}><PasswordInput value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></Field>
        <div className="flex justify-end"><Button loading={change.isPending} disabled={!cur || !!passwordProblem(next)} onClick={() => change.mutate({ currentPassword: cur, newPassword: next })}>Update password</Button></div></div></Modal>
    </div>
  );
}
