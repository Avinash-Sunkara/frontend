"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Mail } from "lucide-react";
import { Button, Field, Input } from "@/components/ui/kit";
import { AuthShell } from "@/components/features/AuthShell";
import { OAuthButtons } from "@/components/features/OAuthButtons";
import { PasswordInput } from "@/components/features/PasswordInput";
import { post } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import { useToast } from "@/providers/toast";
import type { User } from "@/lib/types";

const schema = z.object({ email: z.string().email("Enter a valid email address"), password: z.string().min(1, "Enter your password"), remember: z.boolean().optional() });
type V = z.infer<typeof schema>;

function Form() {
  const router = useRouter(); const sp = useSearchParams(); const { refresh } = useAuth(); const { toast } = useToast();
  const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema), defaultValues: { remember: true } });
  const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");
  const onSubmit = handleSubmit(async (v) => {
    setErr("");
    try {
      const u = await post<User>("/auth/login", v);
      await refresh(); toast({ title: `Welcome back, ${u.username ?? "friend"}`, type: "success" });
      router.replace(safeNext(sp.get("next")));
    } catch (e: any) {
      setErr(e.status === 401 ? "Incorrect email or password. If you signed up with Google or GitHub, use that button above." : e.status === 403 ? "This account is blocked. Contact support." : e.message);
    }
  });
  return (
    <AuthShell title="Sign in" subtitle="Pick up right where you left off.">
      <OAuthButtons />
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail />} invalid={!!errors.email} {...register("email")} /></Field>
        <div className="space-y-1.5"><label htmlFor="login-password" className="block text-sm font-medium text-muted">Password</label><PasswordInput id="login-password" autoComplete="current-password" placeholder="••••••••" invalid={!!errors.password} {...register("password")} />
          {errors.password?.message && <span role="alert" className="block text-xs text-hard">{errors.password.message}</span>}</div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--brand))]" {...register("remember")} />Remember me</label>
          <Link href="/forgot-password" className="font-semibold text-brand hover:underline">Forgot password?</Link>
        </div>
        {err && <p role="alert" className="rounded-xl border border-hard/30 bg-hard/10 px-3.5 py-2.5 text-sm text-hard">{err}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Sign in <ArrowRight className="h-4 w-4" /></Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">New here? <Link href="/register" className="font-semibold text-brand hover:underline">Create an account</Link></p>
    </AuthShell>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
