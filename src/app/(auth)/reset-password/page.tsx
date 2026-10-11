"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Field } from "@/components/ui/kit";
import { AuthShell } from "@/components/features/AuthShell";
import { PasswordInput } from "@/components/features/PasswordInput";
import { post } from "@/lib/api";
import { PASSWORD_HINT, passwordRule } from "@/lib/password";
import { useToast } from "@/providers/toast";

const schema = z.object({ password: passwordRule, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type V = z.infer<typeof schema>;
function Form() {
  const token = useSearchParams().get("token"); const router = useRouter(); const { toast } = useToast(); const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(async (v) => {
    setErr("");
    try { await post("/auth/reset-password", { token, password: v.password }); toast({ title: "Password updated", message: "Sign in with your new password.", type: "success" }); router.replace("/login"); }
    catch (e: any) { setErr(e.status === 400 || e.status === 404 ? "This reset link is invalid or has expired. Request a new one." : e.message); }
  });
  return (
    <AuthShell title="Choose a new password" subtitle={PASSWORD_HINT} hero={false}>
      {!token ? <p className="text-sm text-hard">This link is missing its token. <Link className="underline" href="/forgot-password">Request a new link</Link>.</p> : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="New password" error={errors.password?.message}><PasswordInput autoComplete="new-password" invalid={!!errors.password} {...register("password")} /></Field>
          <Field label="Confirm password" error={errors.confirm?.message}><PasswordInput autoComplete="new-password" invalid={!!errors.confirm} {...register("confirm")} /></Field>
          {err && <p role="alert" className="text-sm text-hard">{err}</p>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Update password</Button>
        </form>)}
    </AuthShell>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
