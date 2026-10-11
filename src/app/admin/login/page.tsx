"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";
import { Button, Card, Field, Input, Logo } from "@/components/ui/kit";
import { PasswordInput } from "@/components/features/PasswordInput";
import { post } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import type { User } from "@/lib/types";

export default function Page() {
  const router = useRouter(); const { refresh } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { const u = await post<User>("/admin/auth/login", { email, password }); if (u.role !== "ADMIN") throw new Error("This account doesn't have admin access."); await refresh(); router.replace("/admin"); }
    catch (e: any) { setErr(e.status === 401 ? "Incorrect email or password." : e.message); } finally { setBusy(false); }
  };
  return (
    <main className="grid min-h-dvh place-items-center p-4"><Card className="w-full max-w-md p-8">
      <Logo /><div className="mt-8 flex items-center gap-2 text-brand"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-bold">Admin console</span></div>
      <h1 className="mt-2 text-2xl font-extrabold">Sign in to continue</h1>
      <form onSubmit={submit} className="mt-6 space-y-4"><Field label="Email"><Input type="email" required autoComplete="username" icon={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><PasswordInput required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {err && <p role="alert" className="text-sm text-hard">{err}</p>}<Button type="submit" size="lg" className="w-full" loading={busy}>Sign in</Button></form>
    </Card></main>
  );
}
