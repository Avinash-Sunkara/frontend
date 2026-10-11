"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { ThemeProvider } from "./theme";
import { ToastProvider } from "./toast";
import { AuthProvider } from "./auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: {
      staleTime: 60_000, refetchOnWindowFocus: false,
      retry: (n, e) => !(e instanceof ApiError && [401, 403, 404, 409].includes(e.status)) && n < 2,
    } },
  }));
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider><ToastProvider><AuthProvider>{children}</AuthProvider></ToastProvider></ThemeProvider>
    </QueryClientProvider>
  );
}
