"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  date: string;
  clicks: number;
  impressions: number;
}

export function SearchPerformanceChart({ data }: { data: DataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">검색 성과 트렌드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              검색 성과 데이터가 없습니다
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.slice(5)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
                  tick={{ fontSize: 11 }}
                  width={45}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                  tick={{ fontSize: 11 }}
                  width={45}
                />
                <Tooltip
                  formatter={(value, name) => [
                    Number(value).toLocaleString(),
                    name === "clicks" ? "클릭" : "노출",
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "clicks" ? "클릭" : "노출"
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clicks"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
