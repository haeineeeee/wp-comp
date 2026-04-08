"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SearchPerformanceChart } from "@/components/seo/search-performance-chart";
import { IndexingStatus } from "@/components/seo/indexing-status";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useSites } from "@/hooks/use-sites";
import { useState } from "react";

export default function SeoPage() {
  const { data: sites } = useSites();
  const [siteFilter, setSiteFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["seo", siteFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (siteFilter) params.set("siteId", siteFilter);
      const res = await fetch(`/api/seo?${params.toString()}`);
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">SEO 모니터링</h1>
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

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-7 w-20" />
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              label="총 클릭"
              value={(data?.summary?.totalClicks ?? 0).toLocaleString()}
            />
            <MetricCard
              label="총 노출"
              value={(data?.summary?.totalImpressions ?? 0).toLocaleString()}
            />
            <MetricCard
              label="평균 CTR"
              value={String(data?.summary?.avgCtr ?? 0)}
              suffix="%"
            />
            <MetricCard
              label="평균 순위"
              value={String(data?.summary?.avgPosition ?? 0)}
            />
          </>
        )}
      </div>

      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </Card>
      ) : (
        <>
          <SearchPerformanceChart data={data?.timeSeries ?? []} />
          <IndexingStatus
            data={data?.indexing ?? { indexed: 0, pending: 0, notIndexed: 0, unknown: 0, total: 0 }}
          />
        </>
      )}
    </div>
  );
}
