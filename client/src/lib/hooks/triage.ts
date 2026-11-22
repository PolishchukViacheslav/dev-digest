/* hooks/triage.ts — cross-PR findings triage: search, bulk status, CSV export. */
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type TriageStatus = "open" | "accepted" | "dismissed";

export interface TriageItem {
  id: string;
  prNumber: number;
  file: string;
  startLine: number;
  endLine: number;
  severity: "CRITICAL" | "WARNING" | "SUGGESTION";
  category: string;
  title: string;
  confidence: number;
  status: TriageStatus;
  priority: number;
}

export interface TriageSearch {
  items: TriageItem[];
  total: number;
  page: number;
  limit: number;
  bySeverity: Record<string, number>;
}

export interface TriageFilter {
  q?: string;
  severity?: string;
  sort?: string;
  page?: number;
}

export function useTriageFindings(filter: TriageFilter) {
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  if (filter.severity) params.set("severity", filter.severity);
  if (filter.sort) params.set("sort", filter.sort);
  params.set("page", String(filter.page ?? 1));
  return useQuery({
    queryKey: ["triage-findings", filter.page],
    queryFn: () => api.get<TriageSearch>(`/triage/findings?${params.toString()}`),
  });
}

export function useBulkTriage() {
  return useMutation({
    mutationFn: (input: { ids: string[]; status: TriageStatus }) =>
      api.post<{ updated: number }>("/triage/findings/bulk", input),
  });
}
