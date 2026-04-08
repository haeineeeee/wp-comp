import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IndexingData {
  indexed: number;
  pending: number;
  notIndexed: number;
  unknown: number;
  total: number;
}

const segments = [
  { key: "indexed" as const, label: "색인됨", color: "#059669" },
  { key: "pending" as const, label: "대기 중", color: "#f59e0b" },
  { key: "notIndexed" as const, label: "미색인", color: "#ef4444" },
  { key: "unknown" as const, label: "미확인", color: "#94a3b8" },
];

export function IndexingStatus({ data }: { data: IndexingData }) {
  if (data.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">색인 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            글 데이터가 없습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">색인 현황</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="flex h-4 overflow-hidden rounded-full">
          {segments.map((seg) => {
            const pct = (data[seg.key] / data.total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={seg.key}
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                className="transition-all"
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-sm">
                {seg.label}{" "}
                <span className="font-medium tabular-nums">{data[seg.key]}</span>
                <span className="text-muted-foreground">
                  {" "}
                  ({data.total > 0
                    ? Math.round((data[seg.key] / data.total) * 100)
                    : 0}
                  %)
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
