"use client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { get, post, put, patch, del, upload } from "@/lib/api";
import type { Page } from "@/lib/types";
import { useToast } from "@/providers/toast";

export function useGet<T>(path: string | null, query?: Record<string, unknown>, opts?: { staleTime?: number; enabled?: boolean }) {
  return useQuery({ queryKey: [path, query], queryFn: ({ signal }) => get<T>(path!, query, signal), enabled: !!path && (opts?.enabled ?? true), staleTime: opts?.staleTime });
}

export function usePaged<T>(path: string, query?: Record<string, unknown>, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: [path, query, "paged"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => get<Page<T>>(path, { ...query, page: pageParam, pageSize }, signal),
    getNextPageParam: (last) => (last.nextPage ?? (last.page * last.pageSize < last.total ? last.page + 1 : undefined)),
  });
}

type Method = "post" | "put" | "patch" | "delete";
export function useAction<TBody = unknown, TRes = unknown>(
  method: Method, path: string | ((b: TBody) => string),
  o?: { invalidate?: QueryKey[]; success?: string; onSuccess?: (r: TRes, b: TBody) => void; optimistic?: (b: TBody) => void; rollback?: () => void },
) {
  const qc = useQueryClient(); const { toast } = useToast();
  return useMutation<TRes, Error, TBody>({
    mutationFn: (b) => {
      const p = typeof path === "function" ? path(b) : path;
      if (typeof FormData !== "undefined" && b instanceof FormData) return upload<TRes>(p, b, method.toUpperCase());
      return method === "post" ? post<TRes>(p, b) : method === "put" ? put<TRes>(p, b) : method === "patch" ? patch<TRes>(p, b) : del<TRes>(p);
    },
    onMutate: (b) => o?.optimistic?.(b),
    onError: (e) => { o?.rollback?.(); toast({ title: "Action failed", message: e.message, type: "error" }); },
    onSuccess: (r, b) => {
      o?.invalidate?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      if (o?.success) toast({ title: o.success, type: "success", ms: 3000 });
      o?.onSuccess?.(r, b);
    },
  });
}
