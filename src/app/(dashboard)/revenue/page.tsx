"use client";

import { useQuery } from "@tanstack/react-query";
import { RevenueOverview } from "@/components/revenue/revenue-overview";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useSites } from "@/hooks/use-sites";
import { useState } from "react";

export default function RevenuePage() {
  const { data: sites } = useSites();
  const [siteFilter, setSiteFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["revenue", siteFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (siteFilter) params.set("siteId", siteFilter);
      const res = await fetch(`/api/revenue?${params.toString()}`);
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">수익 분석</h1>
        {(sites?.length ?? 0) > 1 && (
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">모든 사이트</option>
            {sites?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4"><Skeleton className="h-12 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-12 w-full" /></Card>
          </div>
          <Card className="p-6"><Skeleton className="h-[300px] w-full" /></Card>
        </div>
      ) : (
        <RevenueOverview
          total={data?.summary?.total ?? 0}
          avgRpm={data?.summary?.avgRpm ?? 0}
          bySite={data?.summary?.bySite ?? []}
          timeSeries={data?.timeSeries ?? []}
        />
      )}
    </div>
  );
}
