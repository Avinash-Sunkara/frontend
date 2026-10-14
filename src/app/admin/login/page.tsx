"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ShieldCheck } from "lucide-react";
import { Button, Card, Field, Input, Logo } from "@/components/ui/kit";
import { PasswordInput } from "@/components/features/PasswordInput";
import { ApiError, post } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import type { User } from "@/lib/types";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address"), password: z.string().min(1, "Enter your password") });
type Credentials = z.infer<typeof schema>;

export default function Page() {
  const router = useRouter(); const { refresh } = useAuth(); const [err, setErr] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Credentials>({ resolver: zodResolver(schema) });
  const submit = handleSubmit(async ({ email, password }) => {
    setErr("");
    try {
      const user = await post<User>("/admin/auth/login", { email, password });
      if (user.role !== "ADMIN") throw new Error("This account doesn't have admin access.");
      await refresh(); router.replace("/admin");
    } catch (e: unknown) {
      setErr(e instanceof ApiError && e.status === 401 ? "Incorrect email or password." : e instanceof Error ? e.message : "Unable to sign in. Please try again.");
    }
  });
  return (
    <main className="grid min-h-dvh place-items-center p-4"><Card className="w-full max-w-md p-8">
      <Logo /><div className="mt-8 flex items-center gap-2 text-brand"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-bold">Admin console</span></div>
      <h1 className="mt-2 text-2xl font-extrabold">Sign in to continue</h1>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="username" icon={<Mail />} invalid={!!errors.email} {...register("email")} /></Field>
        <div className="space-y-1.5"><label htmlFor="admin-password" className="block text-sm font-medium text-muted">Password</label><PasswordInput id="admin-password" autoComplete="current-password" invalid={!!errors.password} {...register("password")} />{errors.password?.message && <span role="alert" className="block text-xs text-hard">{errors.password.message}</span>}</div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted">Use your admin account.</span>
          <Link href="/forgot-password" className="font-semibold text-brand hover:underline">Forgot password?</Link>
        </div>
        {err && <p role="alert" className="text-sm text-hard">{err}</p>}<Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Sign in</Button>
      </form>
    </Card></main>
  );
}
