"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button, Card, Field, Logo } from "@/components/ui/kit";
import { PasswordInput } from "@/components/features/PasswordInput";
import { post } from "@/lib/api";
import { PASSWORD_HINT, passwordProblem } from "@/lib/password";
import { useAuth } from "@/providers/auth";
import { useToast } from "@/providers/toast";

/** The bootstrap admin is created with a temporary password; the API refuses every admin request until it is replaced. */
export function ForcePasswordChange() {
  const { refresh, logout } = useAuth(); const { toast } = useToast();
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [again, setAgain] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const problem = passwordProblem(next);
    if (problem) return setErr(problem);
    if (next !== again) return setErr("The new passwords don't match.");
    if (next === cur) return setErr("Choose a password different from the temporary one.");
    setBusy(true);
    try { await post("/me/password", { currentPassword: cur, newPassword: next }); await refresh(); toast({ title: "Password updated", type: "success" }); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <main className="grid min-h-dvh place-items-center p-4"><Card className="w-full max-w-md p-8">
      <Logo /><div className="mt-8 flex items-center gap-2 text-brand"><KeyRound className="h-5 w-5" /><span className="text-sm font-bold">One-time setup</span></div>
      <h1 className="mt-2 text-2xl font-extrabold">Set a new admin password</h1>
      <p className="mt-1 text-sm text-muted">Replace the temporary password from your server settings before you continue. {PASSWORD_HINT}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Temporary password"><PasswordInput required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
        <Field label="New password"><PasswordInput required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Field label="Confirm new password"><PasswordInput required autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} /></Field>
        {err && <p role="alert" className="text-sm text-hard">{err}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Save and continue</Button>
        <button type="button" onClick={logout} className="w-full text-center text-sm text-muted hover:text-fg">Sign out</button>
      </form>
    </Card></main>
  );
}
