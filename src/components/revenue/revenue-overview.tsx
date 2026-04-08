"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SiteRevenue {
  siteId: string;
  siteName: string;
  revenue: number;
  avgRpm: number;
}

interface TimeSeriesPoint {
  date: string;
  revenue: number;
  rpm: number;
}

interface Props {
  total: number;
  avgRpm: number;
  bySite: SiteRevenue[];
  timeSeries: TimeSeriesPoint[];
}

export function RevenueOverview({ total, avgRpm, bySite, timeSeries }: Props) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">총 수익 (30일)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">${total.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">평균 RPM</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">${avgRpm.toFixed(2)}</p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">일별 수익</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {timeSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                수익 데이터가 없습니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => v.slice(5)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v}`}
                    tick={{ fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "수익"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Site Comparison */}
      {bySite.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">사이트별 수익 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bySite.map((site) => {
                const pct = total > 0 ? (site.revenue / total) * 100 : 0;
                return (
                  <div key={site.siteId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{site.siteName}</span>
                      <span className="tabular-nums">${site.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-emerald-600"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      RPM ${site.avgRpm} · {pct.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
