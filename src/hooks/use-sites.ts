"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Site {
  id: string;
  name: string;
  url: string;
  status: string;
  lastSyncAt: string | null;
  createdAt: string;
}

export function useSites() {
  return useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: async () => {
      const res = await fetch("/api/sites");
      if (!res.ok) return [];
      const data = await res.json();
      return data.sites;
    },
  });
}

export function useInvalidateSites() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["sites"] });
}
