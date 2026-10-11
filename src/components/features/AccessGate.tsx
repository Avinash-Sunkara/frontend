"use client";
import { useState } from "react";
import { Lock, Crown } from "lucide-react";
import { Button, Card, Input } from "@/components/ui/kit";
import { useAction } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { fmtInr } from "@/lib/utils";
import type { PaymentInit } from "@/lib/types";
import { useToast } from "@/providers/toast";

export type ContentKind = "note" | "roadmap" | "cheat-sheet" | "problem" | "topic";

/**
 * Premium / private gate.
 * The payment URL always comes from the backend. Opening it proves nothing — the content unlocks only
 * when the backend reports the order as PAID (gateway webhook or admin verification); we poll for that.
 */
export function AccessGate({ kind, id, price, access = "PREMIUM", title, onUnlocked }: {
  kind: ContentKind; id: string; price?: number; access?: "PRIVATE" | "PREMIUM" | "FREE"; title?: string; onUnlocked?: () => void;
}) {
  const { toast } = useToast();
  const [order, setOrder] = useState<PaymentInit | null>(null);
  const [review, setReview] = useState(false);
  const [ref, setRef] = useState("");
  const poll = (orderId: string) => {
    let n = 0;
    const t = setInterval(async () => {
      n++;
      try {
        const s = await api<{ status: "PENDING" | "PAID" | "FAILED"; inReview?: boolean }>(`/payments/orders/${orderId}`); setReview(!!s.inReview);
        if (s.status === "PAID") { clearInterval(t); toast({ title: "Unlocked", message: "Payment verified.", type: "success" }); onUnlocked?.(); }
        else if (s.status === "FAILED") { clearInterval(t); toast({ title: "Payment failed", message: "No charge was verified. Try again.", type: "error" }); }
      } catch { /* keep polling */ }
      if (n > 90) clearInterval(t);
    }, 4000);
  };
  const openRazorpay = (c: NonNullable<PaymentInit["checkout"]>, orderId: string) => {
    const start = () => new (window as any).Razorpay({ key: c.keyId, amount: c.amount, currency: c.currency, order_id: c.orderId, name: title ?? "Unlock content", handler: () => poll(orderId) }).open();
    if ((window as any).Razorpay) return start();
    const sc = document.createElement("script"); sc.src = "https://checkout.razorpay.com/v1/checkout.js"; sc.onload = start; document.body.appendChild(sc);
  };
  const pay = useAction<{ kind: ContentKind; id: string }, PaymentInit>("post", "/payments/checkout", {
    onSuccess: (r) => {
      setOrder(r);
      if (r.checkout) { openRazorpay(r.checkout, r.orderId); toast({ title: "Complete your payment", message: "This unlocks automatically once the payment is verified.", ms: 6000 }); }
      else { if (r.paymentUrl) window.open(r.paymentUrl, "_blank", "noopener,noreferrer"); toast({ title: "Complete your payment", message: "After paying, enter your UPI transaction ID below so we can verify it.", ms: 7000 }); }
      poll(r.orderId);
    },
  });
  const proof = useAction<{ reference: string }, void>("post", order ? `/payments/orders/${order.orderId}/proof` : "/payments/orders/none/proof", { success: "Submitted — we'll verify it shortly", onSuccess: () => setReview(true) });
  if (access === "PRIVATE") {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center"><Lock className="mx-auto h-8 w-8 text-faint" />
        <h2 className="mt-3 text-xl font-bold">Private content</h2>
        <p className="mt-1 text-sm text-muted">This isn&apos;t shared with your account. Contact the admin if you think you should have access.</p></Card>);
  }
  return (
    <Card className="relative mx-auto max-w-lg overflow-hidden p-8 text-center">
      <div className="hero-glow absolute inset-0" />
      <div className="relative">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-medium/15 text-medium"><Crown className="h-7 w-7" /></span>
        <p className="mt-4 text-sm font-semibold text-medium">Premium Content</p>
        <h2 className="mt-1 text-2xl font-bold">{title ?? "Unlock this content"}</h2>
        <p className="mt-3 text-4xl font-extrabold">{fmtInr(price)}</p>
        <p className="mt-1 text-sm text-muted">One-time unlock. Access updates after payment is verified.</p>
        <Button size="lg" className="mt-6 w-full" loading={pay.isPending} onClick={() => pay.mutate({ kind, id })}>{order ? "Open payment again" : `Pay Now · Unlock for ${fmtInr(price)}`}</Button>
        {order && !order.checkout && (review
          ? <p className="mt-4 text-sm text-muted">Your transaction ID is with our team for verification. This page unlocks automatically once it is approved.</p>
          : <div className="mt-5 space-y-2 text-left"><label className="text-sm font-medium" htmlFor="utr">UPI transaction ID (UTR)</label>
              <div className="flex gap-2"><Input id="utr" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. 412345678901" />
                <Button variant="outline" disabled={ref.trim().length < 6} loading={proof.isPending} onClick={() => proof.mutate({ reference: ref.trim() })}>Submit</Button></div>
              {order.reference && <p className="text-xs text-faint">Add reference {order.reference} in the payment note.</p>}</div>)}
      </div>
    </Card>
  );
}
