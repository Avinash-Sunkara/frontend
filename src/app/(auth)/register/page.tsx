"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AtSign, Mail, User as UserIcon } from "lucide-react";
import { Button, Field, Input } from "@/components/ui/kit";
import { AuthShell } from "@/components/features/AuthShell";
import { OAuthButtons } from "@/components/features/OAuthButtons";
import { PasswordInput } from "@/components/features/PasswordInput";
import { post } from "@/lib/api";
import { passwordRule } from "@/lib/password";
import { useAuth } from "@/providers/auth";
import { useToast } from "@/providers/toast";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  username: z.string().trim().regex(/^[a-zA-Z0-9_]{3,30}$/, "3-30 letters, numbers or underscores"),
  email: z.string().trim().email("Enter a valid email address"),
  password: passwordRule,
  confirm: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: "Accept the terms to continue" }) }),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type V = z.infer<typeof schema>;

export default function Page() {
  const router = useRouter(); const { refresh } = useAuth(); const { toast } = useToast();
  const [err, setErr] = useState("");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(async ({ confirm, terms, ...v }) => {
    setErr("");
    try {
      await post("/auth/register", v); await refresh();
      toast({ title: "Account created", message: "Let's get started.", type: "success" }); router.replace("/dashboard");
    } catch (e: any) {
      if (e.status === 409) {
        const f = e.data?.field === "username" ? "username" : "email";
        setError(f, { message: f === "username" ? "That username is taken" : "An account with this email already exists" });
      } else if (e.status === 422 && ["fullName", "username", "email", "password"].includes(e.data?.field)) setError(e.data.field, { message: e.message.replace(/^\w+: /, "") });
      else setErr(e.message);
    }
  });
  return (
    <AuthShell title="Create your account" subtitle="Free to start. The first pattern takes about 10 minutes.">
      <OAuthButtons />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.fullName?.message}><Input autoComplete="name" icon={<UserIcon />} invalid={!!errors.fullName} {...register("fullName")} /></Field>
        <Field label="Username" error={errors.username?.message}><Input autoComplete="username" icon={<AtSign />} invalid={!!errors.username} {...register("username")} /></Field>
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" icon={<Mail />} invalid={!!errors.email} {...register("email")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.password?.message}><PasswordInput autoComplete="new-password" invalid={!!errors.password} {...register("password")} /></Field>
          <Field label="Confirm password" error={errors.confirm?.message}><PasswordInput autoComplete="new-password" invalid={!!errors.confirm} {...register("confirm")} /></Field>
        </div>
        <div>
          <label className="flex items-start gap-2 text-sm text-muted"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[rgb(var(--brand))]" {...register("terms")} />
            <span>I agree to the <Link href="/terms" className="text-brand hover:underline">Terms</Link> and <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.</span></label>
          {errors.terms && <p role="alert" className="mt-1 text-xs text-hard">{errors.terms.message}</p>}
        </div>
        {err && <p role="alert" className="rounded-xl border border-hard/30 bg-hard/10 px-3.5 py-2.5 text-sm text-hard">{err}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}
