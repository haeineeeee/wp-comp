"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueData {
  date: string;
  revenue: number;
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">수익 트렌드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              수익 데이터가 없습니다
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.slice(5)}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  width={50}
                />
                <Tooltip
                  labelFormatter={(v) => v}
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "수익",
                  ]}
                />
                <Bar dataKey="revenue" fill="#059669" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
