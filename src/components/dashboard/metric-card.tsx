import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number | null; // 퍼센트 변화량
  prefix?: string;
  suffix?: string;
}

export function MetricCard({ label, value, change, prefix, suffix }: MetricCardProps) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {prefix}
        {value}
        {suffix}
      </p>
      {change !== null && change !== undefined && (
        <div className="mt-1 flex items-center gap-1">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-600" />
          ) : change < 0 ? (
            <TrendingDown className="h-3 w-3 text-red-500" />
          ) : (
            <Minus className="h-3 w-3 text-muted-foreground" />
          )}
          <span
            className={`text-xs font-medium ${
              change > 0
                ? "text-emerald-600"
                : change < 0
                  ? "text-red-500"
                  : "text-muted-foreground"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change}% 지난주 대비
          </span>
        </div>
      )}
    </Card>
  );
}
