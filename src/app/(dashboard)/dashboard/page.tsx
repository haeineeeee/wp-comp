"use client";

import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrafficChart } from "@/components/dashboard/traffic-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopPosts } from "@/components/dashboard/top-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      return res.json();
    },
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard-chart"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/chart");
      return res.json();
    },
  });

  const overview = data?.overview;
  const hasSites = overview?.siteCount > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-7 w-20" />
              <Skeleton className="mt-2 h-3 w-24" />
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              label="Pageviews"
              value={overview?.totalPageviews?.toLocaleString() ?? "0"}
              change={overview?.pvChange}
            />
            <MetricCard
              label="Revenue"
              value={overview?.totalRevenue?.toFixed(2) ?? "0"}
              prefix="$"
              change={overview?.revenueChange}
            />
            <MetricCard
              label="Index Rate"
              value={String(overview?.indexRate ?? 0)}
              suffix="%"
            />
            <MetricCard
              label="Sites"
              value={String(overview?.siteCount ?? 0)}
            />
          </>
        )}
      </div>

      {!isLoading && !hasSites ? (
        /* Empty state */
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
            <span className="text-xl">🌐</span>
          </div>
          <h2 className="mt-4 text-base font-semibold">사이트를 추가해주세요</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            워드프레스 사이트를 연결하면 트래픽, 수익, SEO 데이터를 한 곳에서 확인할 수 있습니다.
          </p>
          <Link
            href="/sites/new"
            className="mt-4 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + 사이트 추가
          </Link>
        </Card>
      ) : (
        <>
          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {chartLoading ? (
              <>
                <Card className="p-6">
                  <Skeleton className="h-[280px] w-full" />
                </Card>
                <Card className="p-6">
                  <Skeleton className="h-[280px] w-full" />
                </Card>
              </>
            ) : (
              <>
                <TrafficChart data={chartData?.traffic ?? []} />
                <RevenueChart data={chartData?.revenue ?? []} />
              </>
            )}
          </div>

          {/* Top Posts */}
          {!isLoading && <TopPosts posts={data?.topPosts ?? []} />}
        </>
      )}
    </div>
  );
}
