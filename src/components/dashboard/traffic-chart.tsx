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

interface TrafficData {
  date: string;
  pageviews: number;
  sessions: number;
}

export function TrafficChart({ data }: { data: TrafficData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">트래픽 트렌드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              트래픽 데이터가 없습니다
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.slice(5)} // MM-DD
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  width={45}
                />
                <Tooltip
                  labelFormatter={(v) => v}
                  formatter={(value, name) => [
                    Number(value).toLocaleString(),
                    name === "pageviews" ? "페이지뷰" : "세션",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.05}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
