"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Mail } from "lucide-react";
import { Button, Field, Input } from "@/components/ui/kit";
import { AuthShell } from "@/components/features/AuthShell";
import { post } from "@/lib/api";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
export default function Page() {
  const [sent, setSent] = useState(""); const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({ resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(async (v) => { setErr(""); try { await post("/auth/forgot-password", v); setSent(v.email); } catch (e: any) { setErr(e.message); } });
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to choose a new one." hero={false}>
      {sent ? (
        <div className="rounded-2xl border border-brand/25 bg-brand/10 p-5 text-sm"><CheckCircle2 className="mb-2 h-6 w-6 text-brand" />
          <p className="font-semibold">Check your inbox</p><p className="mt-1 text-muted">If an account exists for {sent}, a reset link is on its way. It expires soon.</p></div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Email" error={errors.email?.message}><Input type="email" icon={<Mail />} autoComplete="email" invalid={!!errors.email} {...register("email")} /></Field>
          {err && <p role="alert" className="text-sm text-hard">{err}</p>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Send reset link</Button>
        </form>)}
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-brand hover:underline">Back to sign in</Link></p>
    </AuthShell>
  );
}
